-- Temporarily disable triggers and manually close the stuck trades
-- First, let's see what triggers exist
SELECT trigger_name, event_manipulation, action_timing 
FROM information_schema.triggers 
WHERE event_object_table = 'trades';

-- Disable all triggers on trades table temporarily
ALTER TABLE public.trades DISABLE TRIGGER ALL;

-- Manually close expired trades without triggers interfering
UPDATE public.trades 
SET status = 'lose', 
    completed_at = NOW(),
    profit_loss_amount = stake_amount * -1
WHERE status = 'pending' 
AND ends_at < NOW();

-- Manually create closing orders for these trades
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
  po.entry_price as exit_price, -- Use entry price as exit since trade lost
  po.quantity,
  -po.stake as realized_pnl, -- Negative stake as loss
  po.trade_id as original_trade_id,
  po.stake,
  po.scale
FROM public.positions_orders po
JOIN public.trades t ON po.trade_id = t.id
WHERE t.status = 'lose' 
AND t.completed_at IS NOT NULL;

-- Delete the positions for closed trades
DELETE FROM public.positions_orders 
WHERE trade_id IN (
  SELECT id FROM public.trades 
  WHERE status = 'lose' 
  AND completed_at IS NOT NULL
);

-- Update trade indicators
UPDATE public.trades 
SET status_indicator = '⚪️ COMPLETED'
WHERE status IN ('lose', 'win');

-- Re-enable triggers
ALTER TABLE public.trades ENABLE TRIGGER ALL;