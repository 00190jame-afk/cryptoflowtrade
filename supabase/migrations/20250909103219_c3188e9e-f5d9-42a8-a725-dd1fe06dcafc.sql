-- Update process_withdrawal to use a valid transactions.status value on rejection
CREATE OR REPLACE FUNCTION public.process_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_withdraw_code TEXT;
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
    
  -- If status is changed to 'rejected'
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Require admin_notes
    IF NEW.admin_notes IS NULL OR trim(NEW.admin_notes) = '' THEN
      RAISE EXCEPTION 'Admin notes are required when rejecting a withdrawal request';
    END IF;
    
    -- Set processed_at
    NEW.processed_at := now();
    
    -- Return money from on_hold back to available balance
    UPDATE public.user_balances
    SET balance = balance + NEW.amount, on_hold = on_hold - NEW.amount, updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Insert transaction record for rejection
    -- IMPORTANT: Use 'failed' instead of 'rejected' to comply with transactions_status_check
    INSERT INTO public.transactions (
      user_id, type, amount, status, payment_method, external_transaction_id, description, currency
    ) VALUES (
      NEW.user_id, 'withdrawal', NEW.amount, 'failed', 'manual_withdrawal', 'REJ-' || NEW.id::text, 'Withdrawal rejected', 'USDT'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;