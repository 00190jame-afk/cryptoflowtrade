-- Disable the conflicting raw-SQL cron job that bypasses closing logic
DO $$
BEGIN
  -- Unschedule job id 3 if it exists
  PERFORM cron.unschedule(3);
EXCEPTION WHEN undefined_function THEN
  -- pg_cron might not be available in some environments; ignore
  NULL;
END $$;

-- Reconcile any stuck positions for trades already set to 'lose'
-- Create closing orders for remaining open positions linked to 'lose' trades, then delete those positions
WITH positions_to_close AS (
  SELECT 
    po.id AS position_id,
    po.user_id,
    po.symbol,
    po.side,
    po.leverage,
    po.entry_price,
    COALESCE(t.current_price, po.mark_price, po.entry_price) AS exit_price,
    po.quantity,
    GREATEST(0, COALESCE(po.stake, 0)) AS stake_amount,
    t.id AS trade_id,
    po.scale
  FROM public.positions_orders po
  JOIN public.trades t ON t.id = po.trade_id
  WHERE t.status = 'lose'
)
INSERT INTO public.closing_orders (
  user_id, symbol, side, leverage, entry_price, exit_price, quantity, realized_pnl, original_trade_id, stake, scale
)
SELECT 
  p.user_id,
  p.symbol,
  p.side,
  p.leverage,
  p.entry_price,
  p.exit_price,
  p.quantity,
  ROUND((-p.stake_amount)::numeric, 2) AS realized_pnl,
  p.trade_id,
  p.stake_amount,
  p.scale
FROM positions_to_close p;

-- Remove the reconciled positions
DELETE FROM public.positions_orders po
USING public.trades t
WHERE po.trade_id = t.id
  AND t.status = 'lose';
