-- Update status indicators for all completed trades that should show as completed
UPDATE public.trades 
SET status_indicator = '⚪️ COMPLETED'
WHERE completed_at IS NOT NULL 
  AND status_indicator != '⚪️ COMPLETED';

-- Also update any trades that have closing orders but no positions (these are completed)
UPDATE public.trades t
SET status_indicator = '⚪️ COMPLETED'
WHERE EXISTS (
  SELECT 1 FROM public.closing_orders co WHERE co.original_trade_id = t.id
) 
AND NOT EXISTS (
  SELECT 1 FROM public.positions_orders po WHERE po.trade_id = t.id
)
AND status_indicator != '⚪️ COMPLETED';