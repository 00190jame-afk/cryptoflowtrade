-- Fix the update_user_balance function to allow both withdrawal and deposit for same trade_id
CREATE OR REPLACE FUNCTION public.update_user_balance(p_user_id uuid, p_amount numeric, p_transaction_type text DEFAULT 'manual'::text, p_description text DEFAULT ''::text, p_trade_id uuid DEFAULT NULL::uuid)
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
  -- If trade_id is provided, check if transaction of same type already exists for this trade
  IF p_trade_id IS NOT NULL THEN
    -- Determine transaction type based on amount
    v_type := CASE WHEN p_amount < 0 THEN 'withdrawal' ELSE 'deposit' END;
    
    IF EXISTS (
      SELECT 1 FROM public.transactions 
      WHERE trade_id = p_trade_id 
        AND user_id = p_user_id 
        AND type = v_type
        AND payment_method = 'system_trade'
    ) THEN
      RAISE NOTICE 'Transaction of type % for trade % already exists, skipping', v_type, p_trade_id;
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