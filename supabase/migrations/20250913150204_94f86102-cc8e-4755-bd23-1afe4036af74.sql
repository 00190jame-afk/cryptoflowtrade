-- Fix: remove legacy status check blocking new trades and keep default behavior

-- 1) Drop any CHECK constraints on public.trades that reference the status column
DO $$
DECLARE r record;
BEGIN
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'public.trades'::regclass 
      AND contype = 'c' 
      AND pg_get_constraintdef(oid) ILIKE '%status%'
  LOOP
    EXECUTE format('ALTER TABLE public.trades DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 2) Ensure desired defaults (idempotent)
ALTER TABLE public.trades
  ALTER COLUMN status SET DEFAULT 'pending';

-- 3) Make sure result can be NULL (idempotent)
ALTER TABLE public.trades
  ALTER COLUMN result DROP NOT NULL;
