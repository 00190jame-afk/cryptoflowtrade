-- Fix the negative on_hold balance issue and prevent duplicate processing
-- First, let's fix the current user's balance
UPDATE public.user_balances 
SET balance = 350.00, on_hold = 0.00, updated_at = now()
WHERE user_id = '18bc1315-c35d-4c35-8c11-ae287e44d1d2';

-- Update the process_withdrawal function to prevent duplicate processing
CREATE OR REPLACE FUNCTION public.process_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_withdraw_code TEXT;
  v_current_balance RECORD;
BEGIN
  -- If status is changed to 'approved'
  IF NEW.status = 'approved' AND OLD.status = 'pending' THEN
    -- Generate unique withdraw code
    LOOP
      v_withdraw_code := 'WD-' || upper(substring(encode(extensions.gen_random_bytes(6), 'base64') from 1 for 8));
      v_withdraw_code := replace(replace(replace(replace(v_withdraw_code, '0', 'X'), 'O', 'Y'), 'I', 'Z'), 'L', 'W');
      
      -- Check if code is unique
      EXIT WHEN NOT EXISTS(SELECT 1 FROM public.withdraw_requests WHERE withdraw_code = v_withdraw_code);
    END LOOP;
    
    -- Set withdraw code and processed_at
    NEW.withdraw_code := v_withdraw_code;
    NEW.processed_at := now();
    
    -- Remove amount from on_hold (money was already moved there when request was created)
    UPDATE public.user_balances
    SET on_hold = on_hold - NEW.amount, updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Insert transaction record
    INSERT INTO public.transactions (
      user_id, type, amount, status, payment_method, external_transaction_id, description, currency
    ) VALUES (
      NEW.user_id, 'withdrawal', NEW.amount, 'completed', 'manual_withdrawal', v_withdraw_code, 'Withdrawal processed', 'USDT'
    );
    
  -- If status is changed to 'rejected' OR 'failed' AND not already processed
  ELSIF (NEW.status = 'rejected' OR NEW.status = 'failed') AND OLD.status = 'pending' AND NEW.processed_at IS NULL THEN
    -- Require admin_notes for rejected status
    IF NEW.status = 'rejected' AND (NEW.admin_notes IS NULL OR trim(NEW.admin_notes) = '') THEN
      RAISE EXCEPTION 'Admin notes are required when rejecting a withdrawal request';
    END IF;
    
    -- Set processed_at to prevent duplicate processing
    NEW.processed_at := now();
    
    -- Get current balance to ensure we don't go negative
    SELECT balance, on_hold INTO v_current_balance
    FROM public.user_balances
    WHERE user_id = NEW.user_id;
    
    -- Only return money if we have sufficient on_hold amount
    IF v_current_balance.on_hold >= NEW.amount THEN
      -- Return money from on_hold back to available balance
      UPDATE public.user_balances
      SET balance = balance + NEW.amount, on_hold = on_hold - NEW.amount, updated_at = now()
      WHERE user_id = NEW.user_id;
      
      -- Insert transaction record for rejection/failure (only if not already exists)
      IF NOT EXISTS (
        SELECT 1 FROM public.transactions
        WHERE external_transaction_id = (CASE WHEN NEW.status = 'failed' THEN 'FAIL-' ELSE 'REJ-' END) || NEW.id::text
      ) THEN
        INSERT INTO public.transactions (
          user_id, type, amount, status, payment_method, external_transaction_id, description, currency
        ) VALUES (
          NEW.user_id, 'withdrawal', NEW.amount, 'failed', 'manual_withdrawal',
          (CASE WHEN NEW.status = 'failed' THEN 'FAIL-' ELSE 'REJ-' END) || NEW.id::text,
          CASE WHEN NEW.status = 'failed' THEN 'Withdrawal failed' ELSE 'Withdrawal rejected' END, 'USDT'
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;