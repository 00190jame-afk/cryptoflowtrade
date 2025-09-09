-- Replace trigger functions without referencing non-existent updated_at column
CREATE OR REPLACE FUNCTION public.trg_trades_set_indicator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_has_positions BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.positions_orders po WHERE po.trade_id = NEW.id) INTO v_has_positions;
  UPDATE public.trades
    SET status_indicator = CASE WHEN v_has_positions THEN '🔵 ACTIVE' ELSE '⚪️ COMPLETED' END
    WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_positions_orders_sync_indicator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_trade_id uuid;
  v_has_positions BOOLEAN;
BEGIN
  v_trade_id := COALESCE(NEW.trade_id, OLD.trade_id);
  IF v_trade_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  SELECT EXISTS(SELECT 1 FROM public.positions_orders po WHERE po.trade_id = v_trade_id) INTO v_has_positions;
  UPDATE public.trades
    SET status_indicator = CASE WHEN v_has_positions THEN '🔵 ACTIVE' ELSE '⚪️ COMPLETED' END
    WHERE id = v_trade_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate triggers (idempotent)
DROP TRIGGER IF EXISTS after_trades_insert_update ON public.trades;
CREATE TRIGGER after_trades_insert_update
AFTER INSERT OR UPDATE OF status ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.trg_trades_set_indicator();

DROP TRIGGER IF EXISTS after_positions_insert ON public.positions_orders;
CREATE TRIGGER after_positions_insert
AFTER INSERT ON public.positions_orders
FOR EACH ROW EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

DROP TRIGGER IF EXISTS after_positions_delete ON public.positions_orders;
CREATE TRIGGER after_positions_delete
AFTER DELETE ON public.positions_orders
FOR EACH ROW EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

-- Initialize indicators
UPDATE public.trades t
SET status_indicator = '🔵 ACTIVE'
WHERE EXISTS (SELECT 1 FROM public.positions_orders po WHERE po.trade_id = t.id);

UPDATE public.trades t
SET status_indicator = '⚪️ COMPLETED'
WHERE NOT EXISTS (SELECT 1 FROM public.positions_orders po WHERE po.trade_id = t.id);