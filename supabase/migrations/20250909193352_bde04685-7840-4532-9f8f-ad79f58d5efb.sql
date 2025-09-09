-- Recreate status_indicator to reflect live positions existence
ALTER TABLE public.trades DROP COLUMN IF EXISTS status_indicator;

ALTER TABLE public.trades ADD COLUMN status_indicator TEXT GENERATED ALWAYS AS (
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM public.positions_orders po WHERE po.trade_id = id
    ) THEN '🔵 ACTIVE'
    ELSE '⚪️ COMPLETED'
  END
) STORED;

-- Performance index to speed up EXISTS lookup
CREATE INDEX IF NOT EXISTS idx_positions_orders_trade_id ON public.positions_orders(trade_id);