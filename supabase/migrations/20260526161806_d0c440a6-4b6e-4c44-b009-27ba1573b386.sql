
CREATE OR REPLACE FUNCTION public.admin_create_recharge_code(p_amount numeric)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_code text;
BEGIN
  IF NOT public.is_any_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;

  v_code := public.generate_recharge_code();

  INSERT INTO public.recharge_codes (code, amount, status, created_by)
  VALUES (v_code, p_amount, 'unused', auth.uid());

  RETURN v_code;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_create_recharge_code(numeric) TO authenticated;
