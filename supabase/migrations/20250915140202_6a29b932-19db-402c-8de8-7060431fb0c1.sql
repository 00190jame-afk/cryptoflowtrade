-- Force close stuck trades by directly manipulating the data
-- This bypasses trigger issues by working with the data directly

-- 1. First, create closing orders for current positions before we modify trades
INSERT INTO public.closing_orders (
  user_id, symbol, side, leverage, entry_price, exit_price, 
  quantity, realized_pnl, original_trade_id, stake, scale
)
SELECT 
  po.user_id,
  po.symbol,
  po.side,
  po.leverage,
  po.entry_price,
  po.entry_price as exit_price,
  po.quantity,
  -COALESCE(po.stake, 0) as realized_pnl,
  po.trade_id as original_trade_id,
  po.stake,
  po.scale
FROM public.positions_orders po
JOIN public.trades t ON po.trade_id = t.id
WHERE t.status = 'pending' 
AND t.ends_at < NOW();

-- 2. Delete the positions for expired trades
DELETE FROM public.positions_orders 
WHERE trade_id IN (
  SELECT id FROM public.trades 
  WHERE status = 'pending' 
  AND ends_at < NOW()
);

-- 3. Update the trades to lose status (this should work now that positions are gone)
UPDATE public.trades 
SET status = 'lose', 
    completed_at = NOW(),
    profit_loss_amount = stake_amount * -1,
    status_indicator = '⚪️ COMPLETED'
WHERE status = 'pending' 
AND ends_at < NOW();