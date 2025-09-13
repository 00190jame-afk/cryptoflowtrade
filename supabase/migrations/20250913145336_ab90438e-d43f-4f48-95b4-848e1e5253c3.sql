-- Align trades table and add business logic triggers for the new admin-confirmation flow

-- 1) Relax/align constraints and defaults
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_result_check;

ALTER TABLE public.trades
  ALTER COLUMN status SET DEFAULT 'pending';

-- Allow result to be nullable and remove default
ALTER TABLE public.trades
  ALTER COLUMN result DROP NOT NULL,
  ALTER COLUMN result DROP DEFAULT;

-- 2) Trigger: deduct stake immediately on trade creation
CREATE OR REPLACE FUNCTION public.trg_trades_after_insert_deduct_stake()
RETURNS trigger AS $$
BEGIN
  -- Deduct the stake upfront from user's available balance
  PERFORM public.update_user_balance(NEW.user_id, -NEW.stake_amount, 'system_trade', 'Trade stake deducted', NEW.id);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If deduction fails (e.g., insufficient balance), raise to prevent creating the trade
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_trades_after_insert_deduct_stake ON public.trades;
CREATE TRIGGER trg_trades_after_insert_deduct_stake
AFTER INSERT ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_after_insert_deduct_stake();

-- 3) Trigger: handle admin decision and auto-completion
CREATE OR REPLACE FUNCTION public.trg_trades_status_change_payout()
RETURNS trigger AS $$
BEGIN
  -- Only act on transition from pending -> win/lose
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- Mark completion time if not already set
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := now();
    END IF;

    -- Pay out profit only when marked as win
    IF NEW.status = 'win' THEN
      PERFORM public.update_user_balance(
        NEW.user_id,
        (NEW.stake_amount * NEW.profit_rate / 100.0),
        'system_trade',
        'Trade win payout',
        NEW.id
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_trades_before_update_status_payout ON public.trades;
CREATE TRIGGER trg_trades_before_update_status_payout
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.trg_trades_status_change_payout();
