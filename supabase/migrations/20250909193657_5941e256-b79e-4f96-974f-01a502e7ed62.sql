-- Drop the generated column and recreate as regular column
ALTER TABLE public.trades DROP COLUMN status_indicator;
ALTER TABLE public.trades ADD COLUMN status_indicator TEXT DEFAULT '⚪️ COMPLETED';

-- Simplified trigger function
CREATE OR REPLACE FUNCTION public.update_trade_indicator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_trade_id uuid;
  v_has_positions BOOLEAN;
BEGIN
  v_trade_id := COALESCE(NEW.trade_id, OLD.trade_id, NEW.id);
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

-- Drop existing triggers first
DROP TRIGGER IF EXISTS after_trades_insert_update ON public.trades;
DROP TRIGGER IF EXISTS after_positions_insert ON public.positions_orders;
DROP TRIGGER IF EXISTS after_positions_delete ON public.positions_orders;

-- Create new triggers
CREATE TRIGGER after_trade_insert
AFTER INSERT ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.update_trade_indicator();

CREATE TRIGGER after_position_insert
AFTER INSERT ON public.positions_orders
FOR EACH ROW EXECUTE FUNCTION public.update_trade_indicator();

CREATE TRIGGER after_position_delete
AFTER DELETE ON public.positions_orders
FOR EACH ROW EXECUTE FUNCTION public.update_trade_indicator();

-- Initialize existing data
UPDATE public.trades t
SET status_indicator = CASE 
  WHEN EXISTS (SELECT 1 FROM public.positions_orders po WHERE po.trade_id = t.id) 
  THEN '🔵 ACTIVE' 
  ELSE '⚪️ COMPLETED' 
END;