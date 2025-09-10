-- Fix update_user_balance RPC function to handle negative amounts properly
CREATE OR REPLACE FUNCTION update_user_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT DEFAULT 'manual',
  p_description TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_balance NUMERIC;
BEGIN
  -- Get current balance or create balance record if it doesn't exist
  SELECT balance INTO v_current_balance
  FROM user_balances 
  WHERE user_id = p_user_id;
  
  -- If user balance doesn't exist, create it with initial balance of 0
  IF NOT FOUND THEN
    INSERT INTO user_balances (user_id, balance, currency)
    VALUES (p_user_id, 0, 'USD');
    v_current_balance := 0;
  END IF;
  
  -- Check if deduction would result in negative balance
  IF (v_current_balance + p_amount) < 0 THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', v_current_balance, ABS(p_amount);
  END IF;
  
  -- Update user balance atomically
  UPDATE user_balances 
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Insert transaction record for tracking
  INSERT INTO transactions (
    user_id,
    type,
    amount,
    status,
    currency,
    payment_method,
    description
  ) VALUES (
    p_user_id,
    p_transaction_type,
    p_amount,
    'completed',
    'USD',
    'system',
    p_description
  );
END;
$$;