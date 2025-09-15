-- Fix trigger to only run on INSERT, not UPDATE
CREATE OR REPLACE FUNCTION public.trg_trades_set_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only set duration and ends_at on INSERT, never on UPDATE
  IF TG_OP = 'INSERT' THEN
    IF NEW.trade_duration IS NULL THEN
      NEW.trade_duration := 180 + (random() * 120)::integer; -- 3-5 minutes
    END IF;
    IF NEW.ends_at IS NULL THEN
      NEW.ends_at := COALESCE(NEW.created_at, now()) + (NEW.trade_duration || ' seconds')::interval;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- Update trigger to handle WIN trades correctly (never complete immediately)
CREATE OR REPLACE FUNCTION public.trg_trades_status_change_payout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Prevent nested trigger effects
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

  -- Only act on transition from pending -> win/lose
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- Set indicator but keep ACTIVE for wins until edge function completes them
    IF NEW.status = 'win' THEN
      NEW.status_indicator := '🔵 ACTIVE'; -- Keep active until edge function finalizes
      -- Never set completed_at for wins, let edge function do it after ends_at
      RETURN NEW;
    END IF;

    -- For LOSE: mark completion immediately
    IF NEW.status = 'lose' THEN
      NEW.status_indicator := '⚪️ COMPLETED';
      IF NEW.completed_at IS NULL THEN
        NEW.completed_at := now();
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Set up cron job with proper headers to run every minute
SELECT cron.schedule(
  'auto-lose-trades-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I"}'::jsonb,
    body := '{"source": "cron"}'::jsonb
  );
  $$
);

-- Remove any existing conflicting cron jobs
SELECT cron.unschedule('invoke-function-every-minute');
SELECT cron.unschedule('auto-lose-trades-scheduler');