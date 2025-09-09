-- Remove all problematic triggers and start fresh
DROP TRIGGER IF EXISTS after_trades_insert ON public.trades;
DROP TRIGGER IF EXISTS after_positions_insert ON public.positions_orders;
DROP TRIGGER IF EXISTS after_positions_delete ON public.positions_orders;

-- Drop the functions
DROP FUNCTION IF EXISTS public.trg_trades_set_indicator();
DROP FUNCTION IF EXISTS public.trg_positions_orders_sync_indicator();

-- Create a simple manual approach - set status_indicator to COMPLETED by default
ALTER TABLE public.trades ALTER COLUMN status_indicator SET DEFAULT '⚪️ COMPLETED';

-- Update all existing trades to have the correct indicator
UPDATE public.trades 
SET status_indicator = CASE 
  WHEN EXISTS (SELECT 1 FROM public.positions_orders po WHERE po.trade_id = trades.id) 
  THEN '🔵 ACTIVE' 
  ELSE '⚪️ COMPLETED' 
END;