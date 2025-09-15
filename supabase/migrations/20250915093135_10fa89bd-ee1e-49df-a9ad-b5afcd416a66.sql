-- Ensure safe, idempotent setup of triggers to auto-close positions when a trade ends
-- and avoid 27000 error by moving cross-row work to AFTER triggers

-- 1) Replace finalize_trade_positions to be compatible with AFTER UPDATE (no NEW mutations)
CREATE OR REPLACE FUNCTION public.finalize_trade_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- Create closing orders from any open positions
    INSERT INTO public.closing_orders (
      user_id,
      symbol,
      side,
      leverage,
      entry_price,
      exit_price,
      quantity,
      realized_pnl,
      original_trade_id,
      stake,
      scale
    )
    SELECT
      po.user_id,
      po.symbol,
      po.side,
      po.leverage,
      po.entry_price,
      COALESCE(NEW.current_price, po.mark_price, po.entry_price) AS exit_price,
      po.quantity,
      CASE
        WHEN NEW.status = 'win' THEN ROUND((COALESCE(po.stake, 0) * NEW.profit_rate / 100.0)::numeric, 2)
        ELSE ROUND((-COALESCE(po.stake, 0))::numeric, 2)
      END AS realized_pnl,
      NEW.id AS original_trade_id,
      po.stake,
      po.scale
    FROM public.positions_orders po
    WHERE po.trade_id = NEW.id;

    -- Remove positions after creating closing orders
    DELETE FROM public.positions_orders po WHERE po.trade_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- 2) Attach triggers with correct timing
-- Drop existing triggers if they exist to avoid duplicates
DROP TRIGGER IF EXISTS trg_trades_finalize_positions ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_status_change_payout ON public.trades;
DROP TRIGGER IF EXISTS trg_trades_set_duration ON public.trades;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_i ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_u ON public.positions_orders;
DROP TRIGGER IF EXISTS trg_positions_orders_sync_indicator_d ON public.positions_orders;

-- AFTER UPDATE: finalize (create closing orders + delete positions) to avoid 27000 error
CREATE TRIGGER trg_trades_finalize_positions
AFTER UPDATE ON public.trades
FOR EACH ROW
WHEN (OLD.status = 'pending' AND NEW.status IN ('win','lose'))
EXECUTE FUNCTION public.finalize_trade_positions();

-- BEFORE UPDATE: set completed_at for lose and defer win completion (no cross-row writes)
CREATE TRIGGER trg_trades_status_change_payout
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_status_change_payout();

-- BEFORE INSERT: ensure ends_at/trade_duration defaults when not provided
CREATE TRIGGER trg_trades_set_duration
BEFORE INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_set_duration();

-- AFTER triggers on positions_orders to keep status_indicator in sync without interfering with the trade update
CREATE TRIGGER trg_positions_orders_sync_indicator_i
AFTER INSERT ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

CREATE TRIGGER trg_positions_orders_sync_indicator_u
AFTER UPDATE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();

CREATE TRIGGER trg_positions_orders_sync_indicator_d
AFTER DELETE ON public.positions_orders
FOR EACH ROW
EXECUTE FUNCTION public.trg_positions_orders_sync_indicator();
