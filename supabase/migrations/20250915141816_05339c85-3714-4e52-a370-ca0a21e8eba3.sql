-- Remove unused columns from trades table
-- These columns are no longer used in the current trading logic
ALTER TABLE public.trades 
DROP COLUMN required_price_change,
DROP COLUMN target_price;