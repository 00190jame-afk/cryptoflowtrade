-- Update process_withdrawal to handle both 'rejected' and 'failed' status changes
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
    
  -- If status is changed to 'rejected' OR 'failed'
  ELSIF (NEW.status = 'rejected' OR NEW.status = 'failed') AND OLD.status = 'pending' THEN
    -- Require admin_notes for rejected status
    IF NEW.status = 'rejected' AND (NEW.admin_notes IS NULL OR trim(NEW.admin_notes) = '') THEN
      RAISE EXCEPTION 'Admin notes are required when rejecting a withdrawal request';
    END IF;
    
    -- Set processed_at
    NEW.processed_at := now();
    
    -- Return money from on_hold back to available balance
    UPDATE public.user_balances
    SET balance = balance + NEW.amount, on_hold = on_hold - NEW.amount, updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Insert transaction record for rejection/failure
    INSERT INTO public.transactions (
      user_id, type, amount, status, payment_method, external_transaction_id, description, currency
    ) VALUES (
      NEW.user_id, 'withdrawal', NEW.amount, 'failed', 'manual_withdrawal', 'REJ-' || NEW.id::text, 
      CASE WHEN NEW.status = 'failed' THEN 'Withdrawal failed' ELSE 'Withdrawal rejected' END, 'USDT'
    );
    
  -- Handle direct status changes to 'failed' (when someone manually updates in Supabase)
  ELSIF NEW.status = 'failed' AND OLD.status != 'failed' AND OLD.status != 'pending' THEN
    -- Set processed_at if not already set
    IF NEW.processed_at IS NULL THEN
      NEW.processed_at := now();
    END IF;
    
    -- Return money from on_hold back to available balance
    UPDATE public.user_balances
    SET balance = balance + NEW.amount, on_hold = on_hold - NEW.amount, updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Insert transaction record for failure
    INSERT INTO public.transactions (
      user_id, type, amount, status, payment_method, external_transaction_id, description, currency
    ) VALUES (
      NEW.user_id, 'withdrawal', NEW.amount, 'failed', 'manual_withdrawal', 'FAIL-' || NEW.id::text, 'Withdrawal failed', 'USDT'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;