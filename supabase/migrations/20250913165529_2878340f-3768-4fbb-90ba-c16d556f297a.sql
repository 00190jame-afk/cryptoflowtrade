-- Defer win payout & completion to scheduled time; keep immediate finalize for lose
CREATE OR REPLACE FUNCTION public.trg_trades_status_change_payout()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only act on transition from pending -> win/lose
  IF TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status IN ('win','lose') THEN
    -- For WIN: do NOT set completed_at or pay out immediately. Let scheduler/edge function finalize later.
    IF NEW.status = 'win' THEN
      RETURN NEW;
    END IF;

    -- For LOSE: mark completion time if not already set
    IF NEW.status = 'lose' THEN
      IF NEW.completed_at IS NULL THEN
        NEW.completed_at := now();
      END IF;
      -- No balance change here: stake was deducted at trade creation
      RETURN NEW;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
