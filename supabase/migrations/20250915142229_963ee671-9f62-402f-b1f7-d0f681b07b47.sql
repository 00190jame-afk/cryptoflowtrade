-- Function to move balance between available and frozen
CREATE OR REPLACE FUNCTION public.update_frozen_balance(
  p_user_id uuid,
  p_amount numeric,
  p_action text -- 'freeze' or 'unfreeze'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_current_balance RECORD;
BEGIN
  -- Ensure caller is the same authenticated user
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Validate action
  IF p_action NOT IN ('freeze', 'unfreeze') THEN
    RAISE EXCEPTION 'Invalid action. Must be "freeze" or "unfreeze"';
  END IF;

  -- Validate amount
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  -- Get current balance
  SELECT balance, frozen INTO v_current_balance
  FROM public.user_balances
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User balance not found';
  END IF;

  -- Execute the action
  IF p_action = 'freeze' THEN
    -- Check if sufficient available balance
    IF v_current_balance.balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient available balance';
    END IF;
    
    -- Move from available to frozen
    UPDATE public.user_balances
    SET 
      balance = balance - p_amount,
      frozen = frozen + p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
    
  ELSIF p_action = 'unfreeze' THEN
    -- Check if sufficient frozen balance
    IF v_current_balance.frozen < p_amount THEN
      RAISE EXCEPTION 'Insufficient frozen balance';
    END IF;
    
    -- Move from frozen to available
    UPDATE public.user_balances
    SET 
      balance = balance + p_amount,
      frozen = frozen - p_amount,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;

  -- Insert transaction record
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
    CASE WHEN p_action = 'freeze' THEN 'freeze' ELSE 'unfreeze' END,
    p_amount,
    'completed',
    'USDT',
    'balance_management',
    CASE WHEN p_action = 'freeze' THEN 'Balance frozen' ELSE 'Balance unfrozen' END
  );
END;
$$;