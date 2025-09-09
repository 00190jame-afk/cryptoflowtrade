-- Create trigger to process withdrawal status changes and backfill existing failed/rejected rows
-- 1) Ensure realtime old records availability and publication (safe if already set)
ALTER TABLE IF EXISTS public.withdraw_requests REPLICA IDENTITY FULL;
DO $$ BEGIN
  EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.withdraw_requests';
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

-- 2) Create/replace trigger to run process_withdrawal on status updates
DROP TRIGGER IF EXISTS trg_process_withdrawal ON public.withdraw_requests;
CREATE TRIGGER trg_process_withdrawal
BEFORE UPDATE ON public.withdraw_requests
FOR EACH ROW
EXECUTE FUNCTION public.process_withdrawal();

-- 3) Backfill: for any rows already marked failed/rejected without processed_at, return funds from on_hold
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT id, user_id, amount, status
    FROM public.withdraw_requests
    WHERE status IN ('failed','rejected') AND processed_at IS NULL
  LOOP
    -- Return funds
    UPDATE public.user_balances
    SET balance = COALESCE(balance,0) + r.amount,
        on_hold = COALESCE(on_hold,0) - r.amount,
        updated_at = now()
    WHERE user_id = r.user_id;

    -- Insert a transaction if not already present
    IF NOT EXISTS (
      SELECT 1 FROM public.transactions
      WHERE external_transaction_id IN ('REJ-' || r.id::text, 'FAIL-' || r.id::text)
    ) THEN
      INSERT INTO public.transactions (
        user_id, type, amount, status, payment_method, external_transaction_id, description, currency
      ) VALUES (
        r.user_id, 'withdrawal', r.amount, 'failed', 'manual_withdrawal',
        (CASE WHEN r.status = 'failed' THEN 'FAIL-' ELSE 'REJ-' END) || r.id::text,
        CASE WHEN r.status = 'failed' THEN 'Withdrawal failed (backfill)'
             ELSE 'Withdrawal rejected (backfill)'
        END,
        'USDT'
      );
    END IF;

    -- Mark as processed
    UPDATE public.withdraw_requests SET processed_at = now() WHERE id = r.id;
  END LOOP;
END $$;