-- Clean up ALL duplicate triggers on trades table
-- First drop all existing triggers
DROP TRIGGER IF EXISTS set_trade_duration_before_insert ON public.trades;
DROP TRIGGER IF EXISTS trades_after_insert_deduct_stake ON public.trades;
DROP TRIGGER IF EXISTS trades_before_update_status ON public.trades;
DROP TRIGGER IF EXISTS trades_finalize_positions ON public.trades;
DROP TRIGGER IF EXISTS trades_set_duration_trigger ON public.trades;
DROP TRIGGER IF EXISTS trades_status_change_payout ON public.trades;
DROP TRIGGER IF EXISTS trg_finalize_trade_positions ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_after_insert_deduct_stake ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_after_status_change_finalize ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_insert_set_duration ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_status_change_payout ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_update_finalize ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_before_update_status_payout ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_finalize_close_positions ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_finalize_positions ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_set_duration ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_status_change_payout ON public.trades;

-- Now create ONLY the essential triggers with clear, non-conflicting logic

-- 1. Set duration on INSERT
CREATE TRIGGER trg_trades_set_duration_insert
BEFORE INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_set_duration();

-- 2. Deduct stake after INSERT
CREATE TRIGGER trg_trades_deduct_stake
AFTER INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();

-- 3. Handle status indicator changes on status UPDATE (but NOT finalize)
CREATE TRIGGER trg_trades_status_indicator
BEFORE UPDATE OF status ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_status_change_payout();

-- 4. ONLY finalize LOSE trades immediately (wins are handled by edge function)
CREATE TRIGGER trg_trades_finalize_lose_only
AFTER UPDATE OF status ON public.trades
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status = 'lose')
EXECUTE FUNCTION public.finalize_trade_positions();