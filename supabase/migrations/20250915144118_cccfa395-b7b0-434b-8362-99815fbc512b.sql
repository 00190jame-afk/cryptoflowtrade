-- Fix "tuple to be updated was already modified by an operation triggered by the current command"
-- 1) Make the positions_orders trigger function skip nested executions
CREATE OR REPLACE FUNCTION public.trg_positions_orders_sync_indicator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trade_id uuid;
  v_has_positions boolean;
BEGIN
  -- Avoid nested updates (e.g., fired indirectly from a trigger on trades)
  IF pg_trigger_depth() > 1 THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_trade_id := COALESCE(NEW.trade_id, OLD.trade_id);
  IF v_trade_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.positions_orders po WHERE po.trade_id = v_trade_id
  ) INTO v_has_positions;

  UPDATE public.trades
  SET status_indicator = CASE WHEN v_has_positions THEN '🔵 ACTIVE' ELSE '⚪️ COMPLETED' END
  WHERE id = v_trade_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- 2) Ensure payout/status change trigger sets indicator without issuing a separate UPDATE later
CREATE OR REPLACE FUNCTION public.trg_trades_status_change_payout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only act on transition from pending -> win/lose
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- Set indicator early to avoid nested updates
    NEW.status_indicator := '⚪️ COMPLETED';

    -- For WIN: do NOT set completed_at or pay out immediately. Let scheduler/edge function finalize later.
    IF NEW.status = 'win' THEN
      RETURN NEW;
    END IF;

    -- For LOSE: mark completion time if not already set
    IF NEW.status = 'lose' THEN
      IF NEW.completed_at IS NULL THEN
        NEW.completed_at := now();
      END IF;
      RETURN NEW;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Recreate triggers with safe timing and drop any conflicting ones
DO $$
BEGIN
  -- Drop possibly existing triggers to avoid duplicates/conflicts
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_update_indicator') THEN
    EXECUTE 'DROP TRIGGER trg_trades_update_indicator ON public.trades';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_trade_indicator') THEN
    EXECUTE 'DROP TRIGGER update_trade_indicator ON public.trades';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_status_change_payout') THEN
    EXECUTE 'DROP TRIGGER trg_trades_status_change_payout ON public.trades';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_after_insert_deduct_stake') THEN
    EXECUTE 'DROP TRIGGER trg_trades_after_insert_deduct_stake ON public.trades';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trades_set_duration') THEN
    EXECUTE 'DROP TRIGGER trg_trades_set_duration ON public.trades';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_finalize_trade_positions') THEN
    EXECUTE 'DROP TRIGGER trg_finalize_trade_positions ON public.trades';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_positions_orders_sync_indicator') THEN
    EXECUTE 'DROP TRIGGER trg_positions_orders_sync_indicator ON public.positions_orders';
  END IF;

  -- Recreate triggers with safe timing
  EXECUTE 'CREATE TRIGGER trg_trades_set_duration
           BEFORE INSERT ON public.trades
           FOR EACH ROW EXECUTE FUNCTION public.trg_trades_set_duration()';

  EXECUTE 'CREATE TRIGGER trg_trades_after_insert_deduct_stake
           AFTER INSERT ON public.trades
           FOR EACH ROW EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake()';

  EXECUTE 'CREATE TRIGGER trg_trades_status_change_payout
           BEFORE UPDATE ON public.trades
           FOR EACH ROW EXECUTE FUNCTION public.trg_trades_status_change_payout()';

  EXECUTE 'CREATE TRIGGER trg_finalize_trade_positions
           AFTER UPDATE ON public.trades
           FOR EACH ROW EXECUTE FUNCTION public.finalize_trade_positions()';

  EXECUTE 'CREATE TRIGGER trg_positions_orders_sync_indicator
           AFTER INSERT OR UPDATE OR DELETE ON public.positions_orders
           FOR EACH ROW EXECUTE FUNCTION public.trg_positions_orders_sync_indicator()';
END $$;