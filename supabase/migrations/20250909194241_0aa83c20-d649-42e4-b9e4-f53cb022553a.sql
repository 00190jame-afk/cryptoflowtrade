-- Re-add only positions_orders triggers to maintain indicators without affecting trade inserts
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

DROP TRIGGER IF EXISTS after_positions_insert ON public.positions_orders;
CREATE TRIGGER after_positions_insert
AFTER INSERT ON public.positions_orders
FOR EACH ROW EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

DROP TRIGGER IF EXISTS after_positions_delete ON public.positions_orders;
CREATE TRIGGER after_positions_delete
AFTER DELETE ON public.positions_orders
FOR EACH ROW EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();