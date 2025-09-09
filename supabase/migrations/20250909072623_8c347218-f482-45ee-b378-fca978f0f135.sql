-- Create a secure RPC to redeem recharge codes and update balance atomically
CREATE OR REPLACE FUNCTION public.redeem_recharge_code(p_code text, p_user_id uuid)
RETURNS TABLE(amount numeric, currency text) AS $$
DECLARE
  v_code RECORD;
BEGIN
  -- Ensure caller is the same authenticated user
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Fetch and lock the recharge code row
  SELECT * INTO v_code
  FROM public.recharge_codes
  WHERE code = trim(upper(p_code))
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid recharge code';
  END IF;

  IF v_code.status <> 'unused' THEN
    RAISE EXCEPTION 'Recharge code has already been redeemed';
  END IF;

  -- Mark code as redeemed
  UPDATE public.recharge_codes
  SET status = 'redeemed', user_id = p_user_id, redeemed_at = now(), updated_at = now()
  WHERE id = v_code.id;

  -- Update or create the user's balance
  UPDATE public.user_balances
  SET balance = COALESCE(balance, 0) + v_code.amount, updated_at = now()
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.user_balances (user_id, balance, currency)
    VALUES (p_user_id, v_code.amount, 'USDT');
  END IF;

  -- Insert a transaction record
  INSERT INTO public.transactions (
    user_id, type, amount, status, payment_method, external_transaction_id, description, currency
  ) VALUES (
    p_user_id, 'deposit', v_code.amount, 'completed', 'recharge_code', v_code.code, 'Recharge code redemption', 'USDT'
  );

  RETURN QUERY SELECT v_code.amount::numeric, 'USDT'::text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION public.redeem_recharge_code(text, uuid) TO authenticated;