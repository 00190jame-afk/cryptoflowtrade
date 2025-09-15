-- Guard against recursive updates causing "tuple to be updated was already modified" errors

-- 1) Update function: update_trade_indicator
CREATE OR REPLACE FUNCTION public.update_trade_indicator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_trade_id uuid;
  v_has_positions BOOLEAN;
BEGIN
  -- Prevent recursion or self-updates when called from trades
  IF pg_trigger_depth() > 1 OR TG_TABLE_NAME = 'trades' THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  v_trade_id := COALESCE(NEW.trade_id, OLD.trade_id, NEW.id);
  IF v_trade_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.positions_orders po WHERE po.trade_id = v_trade_id
  ) INTO v_has_positions;

  -- Only write if value actually changes
  UPDATE public.trades
  SET status_indicator = CASE WHEN v_has_positions THEN '🔵 ACTIVE' ELSE '⚪️ COMPLETED' END
  WHERE id = v_trade_id
    AND status_indicator IS DISTINCT FROM CASE WHEN v_has_positions THEN '🔵 ACTIVE' ELSE '⚪️ COMPLETED' END;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 2) Update function: trg_trades_status_change_payout – add guard
CREATE OR REPLACE FUNCTION public.trg_trades_status_change_payout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Prevent nested trigger effects
  IF pg_trigger_depth() > 1 THEN
    RETURN NEW;
  END IF;

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
$function$;

-- 3) Ensure we only attach update_trade_indicator to positions_orders table (idempotent)
DO $$
BEGIN
  -- Create trigger on positions_orders if missing
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_positions_orders_update_indicator'
  ) THEN
    CREATE TRIGGER trg_positions_orders_update_indicator
    AFTER INSERT OR UPDATE OR DELETE ON public.positions_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_trade_indicator();
  END IF;

  -- If there is any trigger on trades using update_trade_indicator, drop it to avoid self-updates
  PERFORM 1 FROM pg_trigger t
  JOIN pg_proc p ON p.oid = t.tgfoid
  JOIN pg_class c ON c.oid = t.tgrelid
  WHERE t.tgname = 'trg_trades_update_indicator' AND c.relname = 'trades' AND p.proname = 'update_trade_indicator';
  IF FOUND THEN
    EXECUTE 'DROP TRIGGER IF EXISTS trg_trades_update_indicator ON public.trades';
  END IF;
END $$;