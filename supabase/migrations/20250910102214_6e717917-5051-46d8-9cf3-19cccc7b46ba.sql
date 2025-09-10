-- Create update_user_balance RPC function for atomic balance updates
CREATE OR REPLACE FUNCTION update_user_balance(
  p_user_id UUID,
  p_amount NUMERIC,
  p_transaction_type TEXT DEFAULT 'manual',
  p_description TEXT DEFAULT ''
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update user balance atomically
  UPDATE user_balances 
  SET balance = balance + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- If user balance doesn't exist, create it
  IF NOT FOUND THEN
    INSERT INTO user_balances (user_id, balance, currency)
    VALUES (p_user_id, GREATEST(p_amount, 0), 'USD');
  END IF;
  
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