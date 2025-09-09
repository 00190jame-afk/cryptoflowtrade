-- Fix the trigger function that's causing the error
DROP TRIGGER IF EXISTS after_trades_insert_update ON public.trades;

-- Create a simpler trigger that sets the indicator correctly for new trades
CREATE OR REPLACE FUNCTION public.trg_trades_set_indicator()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- For new trades, they start as COMPLETED (no position exists yet)
  NEW.status_indicator := '⚪️ COMPLETED';
  RETURN NEW;
END;
$$;

-- Create trigger only for INSERT (new trades start as COMPLETED)
CREATE TRIGGER after_trades_insert
BEFORE INSERT ON public.trades
FOR EACH ROW EXECUTE FUNCTION public.trg_trades_set_indicator();

-- Keep the positions trigger to update trade indicators when positions change
-- This one should work fine as it only deals with positions_orders table