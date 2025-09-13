-- Ensure required triggers exist and backfill scheduling for existing 'win' trades
-- 1) BEFORE UPDATE trigger to schedule ends_at and handle immediate finalization paths
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_before_update_finalize'
  ) THEN
    CREATE TRIGGER trg_trades_before_update_finalize
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.finalize_trade_positions();
  END IF;
END $$;

-- 2) BEFORE UPDATE trigger to set completed_at for lose and skip payout for win
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_before_update_status_payout'
  ) THEN
    CREATE TRIGGER trg_trades_before_update_status_payout
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_status_change_payout();
  END IF;
END $$;

-- 3) BEFORE INSERT trigger to auto set trade_duration and ends_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_before_insert_set_duration'
  ) THEN
    CREATE TRIGGER trg_trades_before_insert_set_duration
    BEFORE INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_set_duration();
  END IF;
END $$;

-- 4) AFTER INSERT trigger to deduct stake (id is available due to default gen_random_uuid())
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_after_insert_deduct_stake'
  ) THEN
    CREATE TRIGGER trg_trades_after_insert_deduct_stake
    AFTER INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();
  END IF;
END $$;

-- 5) Sync status indicator when positions change
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_positions_orders_sync_indicator_ad'
  ) THEN
    CREATE TRIGGER trg_positions_orders_sync_indicator_ad
    AFTER INSERT OR DELETE OR UPDATE ON public.positions_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();
  END IF;
END $$;

-- 6) Backfill: schedule ends_at for trades already set to 'win' but not yet scheduled or completed
UPDATE public.trades t
SET ends_at = now() + ((180 + (random() * 120))::integer) * interval '1 second'
WHERE t.status = 'win'
  AND t.completed_at IS NULL
  AND (t.ends_at IS NULL OR t.ends_at <= now());