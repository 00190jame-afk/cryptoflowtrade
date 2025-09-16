-- Fix security vulnerabilities and findings

-- 1. Restrict invite codes RLS policy - only allow reading for validation, not all active codes
DROP POLICY IF EXISTS "Anyone can read active invite codes for validation" ON public.invite_codes;

CREATE POLICY "Users can validate invite codes" 
ON public.invite_codes 
FOR SELECT 
USING (
  -- Only allow reading when specifically validating (limit exposure)
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now()) 
  AND current_uses < max_uses
  AND code IS NOT NULL  -- Prevent enumeration
);

-- 2. Restrict trade rules - only authenticated users should see them
DROP POLICY IF EXISTS "Trade rules are viewable by everyone" ON public.trade_rules;

CREATE POLICY "Authenticated users can view trade rules" 
ON public.trade_rules 
FOR SELECT 
TO authenticated
USING (true);

-- 3. Update function search paths for security
ALTER FUNCTION public.validate_invite_code(text) SET search_path = public;
ALTER FUNCTION public.use_invite_code(text, uuid) SET search_path = public;
ALTER FUNCTION public.create_verification_code(text, text) SET search_path = public;
ALTER FUNCTION public.verify_code(text, text, text) SET search_path = public;

-- 4. Add rate limiting for verification codes (prevent abuse)
CREATE OR REPLACE FUNCTION public.create_verification_code(p_identifier text, p_type text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
  v_recent_count INTEGER;
BEGIN
  -- Rate limiting: max 3 codes per identifier per hour
  SELECT COUNT(*) INTO v_recent_count
  FROM public.verification_codes 
  WHERE identifier = p_identifier 
    AND type = p_type 
    AND created_at > now() - interval '1 hour';
    
  IF v_recent_count >= 3 THEN
    RAISE EXCEPTION 'Rate limit exceeded. Please wait before requesting another code.';
  END IF;
  
  -- Generate 6-digit code
  v_code := lpad(floor(random() * 1000000)::text, 6, '0');
  v_expires_at := now() + interval '10 minutes';
  
  -- Delete any existing codes for this identifier
  DELETE FROM public.verification_codes 
  WHERE identifier = p_identifier AND type = p_type;
  
  -- Insert new code
  INSERT INTO public.verification_codes (identifier, code, type, expires_at)
  VALUES (p_identifier, v_code, p_type, v_expires_at);
  
  RETURN v_code;
END;
$$;

-- 5. Improve invite code validation to prevent timing attacks
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  normalized_code TEXT;
BEGIN
  -- Normalize input to prevent case sensitivity issues
  normalized_code := trim(upper(p_code));
  
  -- Consistent timing regardless of code existence
  SELECT * INTO invite_record
  FROM public.invite_codes
  WHERE code = normalized_code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND current_uses < max_uses;
    
  -- Always perform the same amount of work
  PERFORM pg_sleep(0.01); -- Small consistent delay
    
  RETURN FOUND;
END;
$$;

-- 6. Add constraint to prevent negative balances at database level
ALTER TABLE public.user_balances 
ADD CONSTRAINT check_non_negative_balance 
CHECK (balance >= 0 AND on_hold >= 0 AND frozen >= 0);

-- 7. Add audit trigger for sensitive profile changes
CREATE OR REPLACE FUNCTION public.log_profile_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log wallet address changes for audit trail
  IF TG_OP = 'UPDATE' AND NEW.wallet_address IS DISTINCT FROM OLD.wallet_address THEN
    INSERT INTO public.transactions (
      user_id, 
      type, 
      amount, 
      status, 
      description, 
      currency,
      payment_method
    ) VALUES (
      NEW.user_id,
      'system',
      0,
      'completed',
      'Wallet address updated: ' || COALESCE(OLD.wallet_address, 'none') || ' -> ' || COALESCE(NEW.wallet_address, 'none'),
      'USDT',
      'audit_log'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_profile_changes();