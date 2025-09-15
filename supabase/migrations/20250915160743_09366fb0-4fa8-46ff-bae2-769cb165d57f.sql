-- Ensure required extensions
-- Note: pg_cron and pg_net are usually enabled in Supabase projects. This block is safe if already enabled.
-- CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
-- CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create triggers only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_trade_duration_before_insert'
  ) THEN
    CREATE TRIGGER set_trade_duration_before_insert
    BEFORE INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_set_duration();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trades_after_insert_deduct_stake'
  ) THEN
    CREATE TRIGGER trades_after_insert_deduct_stake
    AFTER INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trades_before_update_status'
  ) THEN
    CREATE TRIGGER trades_before_update_status
    BEFORE UPDATE OF status ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_status_change_payout();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trades_finalize_positions'
  ) THEN
    CREATE TRIGGER trades_finalize_positions
    AFTER UPDATE OF status ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.finalize_trade_positions();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'positions_orders_sync_indicator'
  ) THEN
    CREATE TRIGGER positions_orders_sync_indicator
    AFTER INSERT OR UPDATE OR DELETE ON public.positions_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();
  END IF;
END $$;

-- Backfill ends_at and trade_duration for existing pending trades
UPDATE public.trades t
SET 
  trade_duration = COALESCE(trade_duration, 240),
  ends_at = COALESCE(ends_at, created_at + make_interval(secs => COALESCE(trade_duration, 240)))
WHERE t.status = 'pending'
  AND (t.ends_at IS NULL OR t.trade_duration IS NULL);

-- Normalize status_indicator based on presence of positions
UPDATE public.trades tr
SET status_indicator = CASE
  WHEN EXISTS (SELECT 1 FROM public.positions_orders po WHERE po.trade_id = tr.id) THEN '🔵 ACTIVE'
  ELSE '⚪️ COMPLETED'
END
WHERE tr.status IN ('pending','win','lose');

-- Ensure cron job exists (idempotent create-or-replace)
-- Drops any existing job with the same name and re-creates it
DO $$
BEGIN
  PERFORM cron.unschedule('auto-lose-trades-every-minute');
EXCEPTION WHEN OTHERS THEN
  -- ignore if not exists
  NULL;
END $$;

SELECT cron.schedule(
  'auto-lose-trades-every-minute',
  '* * * * *',
  $$
  SELECT
    net.http_post(
        url:='https://llvsxldpsdmhlzexioil.supabase.co/functions/v1/auto-lose-trades',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxsdnN4bGRwc2RtaGx6ZXhpb2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NjEzMjcsImV4cCI6MjA3MjAzNzMyN30.4FLl8CFBCSc-doEzyIuXgR8P4vYbU-z8k3aTp48wm_I"}'::jsonb,
        body:='{"source": "cron"}'::jsonb
    ) as request_id;
  $$
);
