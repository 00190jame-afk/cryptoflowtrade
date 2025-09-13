-- Update the trading logic system

-- First, ensure we have the correct database functions for trading logic
CREATE OR REPLACE FUNCTION public.update_user_balance_trade(
  p_user_id uuid,
  p_amount numeric,
  p_description text DEFAULT '',
  p_trade_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_balance numeric;
  v_type text;
  v_amount numeric;
BEGIN
  -- Get current balance or create balance record if it doesn't exist
  SELECT balance INTO v_current_balance
  FROM public.user_balances 
  WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO public.user_balances (user_id, balance, currency)
    VALUES (p_user_id, 0, 'USDT');
    v_current_balance := 0;
  END IF;
  
  -- Prevent negative result balance
  IF (v_current_balance + p_amount) < 0 THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Update user balance
  UPDATE public.user_balances 
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Insert normalized transaction record (positive amounts only)
  v_amount := ABS(p_amount);
  v_type := CASE WHEN p_amount < 0 THEN 'withdrawal' ELSE 'deposit' END;
  
  INSERT INTO public.transactions (
    user_id,
    type,
    amount,
    status,
    currency,
    payment_method,
    description,
    trade_id
  ) VALUES (
    p_user_id,
    v_type,
    v_amount,
    'completed',
    'USDT',
    'system_trade',
    p_description,
    p_trade_id
  );
END;
$$;

-- Create trigger function for stake deduction on trade creation
CREATE OR REPLACE FUNCTION public.trg_trades_deduct_stake()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Deduct the stake upfront from user's available balance
  PERFORM public.update_user_balance_trade(
    NEW.user_id, 
    -NEW.stake_amount, 
    'Trade stake deducted for ' || NEW.trading_pair,
    NEW.id
  );
  
  -- Set random trade duration (3-5 minutes) and end time
  NEW.trade_duration := 180 + (random() * 120)::integer; -- 3-5 minutes in seconds
  NEW.ends_at := NEW.created_at + (NEW.trade_duration || ' seconds')::interval;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If deduction fails (e.g., insufficient balance), raise to prevent creating the trade
  RAISE;
END;
$$;

-- Create trigger function for trade completion payouts
CREATE OR REPLACE FUNCTION public.trg_trades_handle_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_payout_amount numeric;
BEGIN
  -- Only act on transition from pending to win/lose
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- Mark completion time if not already set
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;

    -- Calculate and pay out for wins only
    IF NEW.status = 'win' THEN
      -- Calculate payout: stake * profit_rate / 100
      v_payout_amount := NEW.stake_amount * NEW.profit_rate / 100.0;
      
      -- Add payout to user's balance
      PERFORM public.update_user_balance_trade(
        NEW.user_id,
        v_payout_amount,
        'Trade win payout for ' || NEW.trading_pair || ' (Profit: ' || NEW.profit_rate || '%)',
        NEW.id
      );
      
      -- Set the profit/loss amount
      NEW.profit_loss_amount := v_payout_amount;
      NEW.result := 'profit';
    ELSIF NEW.status = 'lose' THEN
      -- For losses, just record the loss amount (stake already deducted)
      NEW.profit_loss_amount := -NEW.stake_amount;
      NEW.result := 'loss';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trades_deduct_stake_trigger ON public.trades;
DROP TRIGGER IF EXISTS trades_completion_trigger ON public.trades;

-- Create new triggers
CREATE TRIGGER trades_deduct_stake_trigger
  BEFORE INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_trades_deduct_stake();

CREATE TRIGGER trades_completion_trigger
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_trades_handle_completion();