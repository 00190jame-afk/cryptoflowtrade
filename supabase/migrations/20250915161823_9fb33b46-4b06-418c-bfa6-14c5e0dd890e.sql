-- Get list of all current triggers to clean up properly
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    -- Drop all triggers on trades table
    FOR rec IN 
        SELECT tgname 
        FROM pg_trigger p
        JOIN pg_class c ON p.tgrelid = c.oid
        WHERE c.relname = 'trades' AND NOT p.tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || rec.tgname || ' ON public.trades';
    END LOOP;
END $$;

-- Drop all triggers on positions_orders table except one we need  
DO $$ 
DECLARE
    rec RECORD;
BEGIN
    FOR rec IN 
        SELECT tgname 
        FROM pg_trigger p
        JOIN pg_class c ON p.tgrelid = c.oid
        WHERE c.relname = 'positions_orders' AND NOT p.tgisinternal
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || rec.tgname || ' ON public.positions_orders';
    END LOOP;
END $$;

-- Now create ONLY the essential triggers

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

-- 5. Keep one trigger for positions_orders to update status indicators
CREATE TRIGGER trg_positions_orders_indicator
AFTER INSERT OR DELETE OR UPDATE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

-- 6. Keep updated_at trigger for positions_orders
CREATE TRIGGER update_positions_orders_updated_at
BEFORE UPDATE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();