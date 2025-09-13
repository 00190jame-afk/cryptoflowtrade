-- Ensure required triggers exist and backfill scheduled completion for wins

-- 1) Create triggers for trades lifecycle
DO $$
BEGIN
  -- BEFORE INSERT: set duration and ends_at
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_before_insert_set_duration'
  ) THEN
    CREATE TRIGGER trg_trades_before_insert_set_duration
    BEFORE INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_set_duration();
  END IF;

  -- AFTER INSERT: deduct stake immediately
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_after_insert_deduct_stake'
  ) THEN
    CREATE TRIGGER trg_trades_after_insert_deduct_stake
    AFTER INSERT ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();
  END IF;

  -- BEFORE UPDATE: finalize or schedule behavior based on status change
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_before_update_finalize'
  ) THEN
    CREATE TRIGGER trg_trades_before_update_finalize
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.finalize_trade_positions();
  END IF;

  -- BEFORE UPDATE: payout bookkeeping for status transitions
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_before_update_status_payout'
  ) THEN
    CREATE TRIGGER trg_trades_before_update_status_payout
    BEFORE UPDATE ON public.trades
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_trades_status_change_payout();
  END IF;
END
$$;

-- 2) Keep trade indicator in sync when positions change
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_positions_orders_after_write'
  ) THEN
    CREATE TRIGGER trg_positions_orders_after_write
    AFTER INSERT OR UPDATE OR DELETE ON public.positions_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();
  END IF;
END
$$;

-- 3) Backfill: any existing WIN trades without a future ends_at should be scheduled 3–5 minutes from now
UPDATE public.trades t
SET ends_at = now() + (180 + floor(random() * 120))::integer * interval '1 second'
WHERE t.status = 'win'
  AND t.completed_at IS NULL
  AND (t.ends_at IS NULL OR t.ends_at <= now());