-- Prevent changing wallet_address once linked (except admins)
CREATE OR REPLACE FUNCTION public.prevent_wallet_address_change()
RETURNS trigger AS $$
BEGIN
  -- Only enforce when wallet_address actually changes
  IF TG_OP = 'UPDATE' AND NEW.wallet_address IS DISTINCT FROM OLD.wallet_address THEN
    -- If an address is already set, block changes unless admin
    IF OLD.wallet_address IS NOT NULL AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Wallet address already linked and cannot be changed';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_prevent_wallet_address_change'
  ) THEN
    CREATE TRIGGER trg_prevent_wallet_address_change
    BEFORE UPDATE OF wallet_address ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_wallet_address_change();
  END IF;
END $$;