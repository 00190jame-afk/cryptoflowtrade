-- Clean up duplicate transactions and update all incomplete trades to completed status
-- First, mark all old active trades as completed to prevent further processing
UPDATE public.trades 
SET status = 'completed', 
    completed_at = COALESCE(completed_at, now()),
    profit_loss_amount = COALESCE(profit_loss_amount, stake_amount * (profit_rate / 100)),
    result = CASE 
      WHEN COALESCE(profit_loss_amount, stake_amount * (profit_rate / 100)) < 0 THEN 'loss' 
      ELSE 'win' 
    END
WHERE status = 'active' 
  AND user_id = '18bc1315-c35d-4c35-8c11-ae287e44d1d2'
  AND (ends_at IS NULL OR ends_at < now());

-- Add unique constraint to prevent duplicate transactions for the same trade
-- But first, we need to clean up existing duplicates and add a trade_id field to track transactions per trade

-- Add trade_id column to transactions if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'trade_id') THEN
    ALTER TABLE public.transactions ADD COLUMN trade_id UUID REFERENCES public.trades(id);
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_trade_id ON public.transactions(trade_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_type_created ON public.transactions(user_id, type, created_at);

-- Enhance the update_user_balance function to prevent duplicate transactions for the same trade
CREATE OR REPLACE FUNCTION public.update_user_balance(
  p_user_id uuid, 
  p_amount numeric, 
  p_transaction_type text DEFAULT 'manual'::text, 
  p_description text DEFAULT ''::text,
  p_trade_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_current_balance numeric;
  v_type text;
  v_amount numeric;
BEGIN
  -- If trade_id is provided, check if transaction already exists
  IF p_trade_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE trade_id = p_trade_id 
        AND user_id = p_user_id 
        AND type IN ('deposit', 'withdrawal')
        AND payment_method = 'system_trade'
    ) THEN
      RAISE NOTICE 'Transaction for trade % already exists, skipping', p_trade_id;
      RETURN;
    END IF;
  END IF;
  
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
$function$;