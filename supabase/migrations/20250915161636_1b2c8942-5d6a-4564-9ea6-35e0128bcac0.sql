-- Clean up all duplicate triggers and use only the necessary ones
-- First, drop all existing triggers on positions_orders except the essential ones
DROP TRIGGER IF EXISTS after_position_delete ON public.positions_orders;
DROP TRIGGER IF EXISTS after_position_insert ON public.positions_orders;
DROP TRIGGER IF EXISTS after_positions_delete ON public.positions_orders;
DROP TRIGGER IF EXISTS after_positions_insert ON public.positions_orders;
DROP TRIGGER IF EXISTS positions_orders_sync_indicator ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_after_delete_sync ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_after_insert_sync ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_after_update_sync ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_after_write ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_ad ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_d ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_i ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_u ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_update_indicator ON public.positions_orders;

-- Keep only one clean trigger for positions_orders
CREATE TRIGGER positions_orders_sync_indicator
AFTER INSERT OR DELETE OR UPDATE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

-- Verify that the finalize_trade_positions function only processes LOSE trades
-- Let me check the current state and ensure it's correct
SELECT pg_get_functiondef(p.oid) as current_function
FROM pg_proc p
WHERE p.proname = 'finalize_trade_positions';