-- Add fields to positions_orders to support Stake, Scale, and (initially empty) Realized PnL
ALTER TABLE public.positions_orders
  ADD COLUMN IF NOT EXISTS stake numeric,
  ADD COLUMN IF NOT EXISTS scale text,
  ADD COLUMN IF NOT EXISTS realized_pnl numeric;