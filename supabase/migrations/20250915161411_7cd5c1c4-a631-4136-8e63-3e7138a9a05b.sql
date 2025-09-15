-- Fix finalize_trade_positions trigger to NOT immediately process wins
-- Wins should only be finalized by the edge function after ends_at time
CREATE OR REPLACE FUNCTION public.finalize_trade_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only process LOSE trades immediately, not WIN trades
  -- WIN trades are processed by edge function after ends_at
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'lose' THEN
    -- Create closing orders from any open positions for LOSS
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
      ROUND((-COALESCE(po.stake, 0))::numeric, 2) AS realized_pnl, -- Loss = negative stake
      NEW.id AS original_trade_id,
      po.stake,
      po.scale
    FROM public.positions_orders po
    WHERE po.trade_id = NEW.id;

    -- Remove positions after creating closing orders for LOSS
    DELETE FROM public.positions_orders po WHERE po.trade_id = NEW.id;
  END IF;

  -- NOTE: WIN trades are NOT processed here - they are handled by edge function
  -- after ends_at time is reached to ensure proper timing

  RETURN NEW;
END;
$function$;

-- Update the trigger to use the fixed function
DROP TRIGGER IF EXISTS trades_finalize_positions ON public.trades;
CREATE TRIGGER trades_finalize_positions
AFTER UPDATE OF status ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.finalize_trade_positions();