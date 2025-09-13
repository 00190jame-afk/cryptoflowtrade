-- Fix failing trade creation and align with existing functions

-- 1) Remove conflicting triggers/functions introduced earlier
DROP TRIGGER IF EXISTS trades_deduct_stake_trigger ON public.trades;
DROP TRIGGER IF EXISTS trades_completion_trigger ON public.trades;

DROP FUNCTION IF EXISTS public.trg_trades_deduct_stake();
DROP FUNCTION IF EXISTS public.trg_trades_handle_completion();
DROP FUNCTION IF EXISTS public.update_user_balance_trade(uuid, numeric, text, uuid);

-- 2) Create BEFORE INSERT trigger to set random duration & ends_at if not provided
CREATE OR REPLACE FUNCTION public.trg_trades_set_duration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.trade_duration IS NULL THEN
    NEW.trade_duration := 180 + (random() * 120)::integer; -- 3-5 minutes
  END IF;
  IF NEW.ends_at IS NULL THEN
    NEW.ends_at := COALESCE(NEW.created_at, now()) + (NEW.trade_duration || ' seconds')::interval;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trades_set_duration_trigger ON public.trades;
CREATE TRIGGER trades_set_duration_trigger
  BEFORE INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_trades_set_duration();

-- 3) Wire existing AFTER/BEFORE triggers that use the already-present logic
-- Deduct stake AFTER INSERT so the trade row exists for FK on transactions.trade_id
DROP TRIGGER IF EXISTS trades_after_insert_deduct_stake ON public.trades;
CREATE TRIGGER trades_after_insert_deduct_stake
  AFTER INSERT ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();

-- Handle payout on status change pending -> win/lose
DROP TRIGGER IF EXISTS trades_status_change_payout ON public.trades;
CREATE TRIGGER trades_status_change_payout
  BEFORE UPDATE ON public.trades
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_trades_status_change_payout();