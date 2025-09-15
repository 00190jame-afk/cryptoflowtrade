-- Fix trade lifecycle triggers to avoid 27000 errors and ensure auto-closing
-- 1) Remove any old/incorrect triggers that might self-update trades
DROP TRIGGER IF EXISTS trg_trades_update_indicator ON public.trades;
DROP TRIGGER IF EXISTS trades_update_indicator ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_status_change_finalize ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_after_status_change ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_status_change_payout ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_after_status_change_finalize ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_insert_set_duration ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_after_insert_deduct_stake ON public.trades;

-- Positions indicators triggers (clean up)
DROP TRIGGER IF EXISTS trg_positions_orders_after_insert_sync ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_after_update_sync ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_after_delete_sync ON public.positions_orders;

-- 2) Create correct triggers
-- Set randomized duration and ends_at on insert
CREATE TRIGGER trg_trades_before_insert_set_duration
BEFORE INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_set_duration();

-- Deduct stake AFTER insert (affects other tables)
CREATE TRIGGER trg_trades_after_insert_deduct_stake
AFTER INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();

-- On status change pending -> win/lose: set completed_at for lose only (modify NEW)
CREATE TRIGGER trg_trades_before_status_change_payout
BEFORE UPDATE OF status ON public.trades
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status IN ('win','lose'))
EXECUTE FUNCTION public.trg_trades_status_change_payout();

-- Finalize positions AFTER status change (create closing orders, delete positions)
CREATE TRIGGER trg_trades_after_status_change_finalize
AFTER UPDATE OF status ON public.trades
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status IN ('win','lose'))
EXECUTE FUNCTION public.finalize_trade_positions();

-- Keep trade indicator synced when positions change (safe: different table updates trades)
CREATE TRIGGER trg_positions_orders_after_insert_sync
AFTER INSERT ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

CREATE TRIGGER trg_positions_orders_after_update_sync
AFTER UPDATE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

CREATE TRIGGER trg_positions_orders_after_delete_sync
AFTER DELETE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();
