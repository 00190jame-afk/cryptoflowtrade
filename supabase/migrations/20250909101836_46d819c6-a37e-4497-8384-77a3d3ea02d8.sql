-- First, let's update the withdrawal process function to handle on_hold properly
CREATE OR REPLACE FUNCTION public.process_withdrawal()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'extensions'
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
    INSERT INTO public.transactions (
      user_id, type, amount, status, payment_method, external_transaction_id, description, currency
    ) VALUES (
      NEW.user_id, 'withdrawal', NEW.amount, 'rejected', 'manual_withdrawal', 'REJ-' || NEW.id::text, 'Withdrawal rejected', 'USDT'
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create a function to handle withdrawal request creation (move money to on_hold)
CREATE OR REPLACE FUNCTION public.create_withdrawal_request(p_amount numeric, p_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_current_balance numeric;
  v_request_id uuid;
BEGIN
  -- Ensure caller is the same authenticated user
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  -- Check if user has sufficient available balance
  SELECT balance INTO v_current_balance
  FROM public.user_balances
  WHERE user_id = p_user_id;

  IF v_current_balance IS NULL THEN
    RAISE EXCEPTION 'User balance not found';
  END IF;

  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;

  -- Move money from balance to on_hold
  UPDATE public.user_balances
  SET balance = balance - p_amount, on_hold = on_hold + p_amount, updated_at = now()
  WHERE user_id = p_user_id;

  -- Create withdrawal request
  INSERT INTO public.withdraw_requests (user_id, amount)
  VALUES (p_user_id, p_amount)
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$function$;