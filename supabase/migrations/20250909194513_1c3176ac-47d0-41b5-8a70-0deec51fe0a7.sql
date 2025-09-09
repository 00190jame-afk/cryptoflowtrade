-- Drop any remaining non-internal triggers on public.trades to fix insert errors
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT tgname FROM pg_trigger WHERE NOT tgisinternal AND tgrelid = 'public.trades'::regclass
  ) LOOP
    EXECUTE 'DROP TRIGGER IF EXISTS ' || quote_ident(r.tgname) || ' ON public.trades';
  END LOOP;
END $$;