-- Normalize transaction types and positive amounts in update_user_balance
CREATE OR REPLACE FUNCTION public.update_user_balance(
  p_user_id uuid,
  p_amount numeric,
  p_transaction_type text DEFAULT 'manual',
  p_description text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
    description
  ) VALUES (
    p_user_id,
    v_type,
    v_amount,
    'completed',
    'USDT',
    'system_trade',
    p_description
  );
END;
$$;