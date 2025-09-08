-- Enable pgcrypto for cryptographic functions used in code generation
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

-- Ensure trigger exists to auto-generate code on insert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    WHERE t.tgname = 'trg_recharge_codes_before_insert'
      AND c.relname = 'recharge_codes'
  ) THEN
    CREATE TRIGGER trg_recharge_codes_before_insert
    BEFORE INSERT ON public.recharge_codes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_recharge_code_insert();
  END IF;
END;
$$;