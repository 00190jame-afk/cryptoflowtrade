-- Create withdraw_requests table
CREATE TABLE public.withdraw_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  withdraw_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT
);

-- Enable RLS
ALTER TABLE public.withdraw_requests ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own withdrawal requests" 
ON public.withdraw_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own withdrawal requests" 
ON public.withdraw_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all withdrawal requests" 
ON public.withdraw_requests 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Create function to process withdrawals
CREATE OR REPLACE FUNCTION public.process_withdrawal()
RETURNS TRIGGER AS $$
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
    
    -- Deduct amount from user balance
    UPDATE public.user_balances
    SET balance = balance - NEW.amount, updated_at = now()
    WHERE user_id = NEW.user_id;
    
    -- Insert transaction record
    INSERT INTO public.transactions (
      user_id, type, amount, status, payment_method, external_transaction_id, description, currency
    ) VALUES (
      NEW.user_id, 'withdrawal', NEW.amount, 'completed', 'manual_withdrawal', v_withdraw_code, 'Manual withdrawal processed', 'USDT'
    );
    
  -- If status is changed to 'rejected'
  ELSIF NEW.status = 'rejected' AND OLD.status = 'pending' THEN
    -- Require admin_notes
    IF NEW.admin_notes IS NULL OR trim(NEW.admin_notes) = '' THEN
      RAISE EXCEPTION 'Admin notes are required when rejecting a withdrawal request';
    END IF;
    
    -- Set processed_at
    NEW.processed_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, extensions;

-- Create trigger
CREATE TRIGGER process_withdrawal_trigger
  BEFORE UPDATE ON public.withdraw_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.process_withdrawal();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.withdraw_requests;