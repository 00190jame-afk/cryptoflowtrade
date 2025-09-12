-- Create invite codes table
CREATE TABLE public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create verification codes table
CREATE TABLE public.verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- email or phone number
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'phone')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT false,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS policies for invite_codes
CREATE POLICY "Anyone can read active invite codes for validation"
ON public.invite_codes
FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()) AND current_uses < max_uses);

CREATE POLICY "Users can view their created invite codes"
ON public.invite_codes
FOR SELECT
USING (auth.uid() = created_by);

-- RLS policies for verification_codes (very restrictive for security)
CREATE POLICY "Users can read their own verification codes"
ON public.verification_codes
FOR SELECT
USING (false); -- No direct access, only via functions

-- Create function to generate invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    new_code := upper(substring(encode(gen_random_bytes(6), 'base64') from 1 for 8));
    -- Remove confusing characters
    new_code := replace(replace(replace(replace(new_code, '0', 'X'), 'O', 'Y'), 'I', 'Z'), 'L', 'W');
    
    -- Check uniqueness
    SELECT EXISTS(SELECT 1 FROM public.invite_codes WHERE code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- Create function to validate invite code
CREATE OR REPLACE FUNCTION public.validate_invite_code(p_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  SELECT * INTO invite_record
  FROM public.invite_codes
  WHERE code = trim(upper(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND current_uses < max_uses;
    
  RETURN FOUND;
END;
$$;

-- Create function to use invite code
CREATE OR REPLACE FUNCTION public.use_invite_code(p_code TEXT, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Lock and get invite code
  SELECT * INTO invite_record
  FROM public.invite_codes
  WHERE code = trim(upper(p_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND current_uses < max_uses
  FOR UPDATE;
    
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Update usage
  UPDATE public.invite_codes
  SET 
    current_uses = current_uses + 1,
    used_by = CASE WHEN current_uses = 0 THEN p_user_id ELSE used_by END,
    updated_at = now()
  WHERE id = invite_record.id;
  
  RETURN true;
END;
$$;

-- Create function to send verification code
CREATE OR REPLACE FUNCTION public.create_verification_code(
  p_identifier TEXT,
  p_type TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_code TEXT;
  v_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
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

-- Create function to verify code
CREATE OR REPLACE FUNCTION public.verify_code(
  p_identifier TEXT,
  p_code TEXT,
  p_type TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_record RECORD;
BEGIN
  -- Get and lock the verification record
  SELECT * INTO v_record
  FROM public.verification_codes
  WHERE identifier = p_identifier 
    AND type = p_type
    AND expires_at > now()
    AND attempts < max_attempts
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Increment attempts
  UPDATE public.verification_codes
  SET attempts = attempts + 1
  WHERE id = v_record.id;
  
  -- Check if code matches
  IF v_record.code = p_code THEN
    UPDATE public.verification_codes
    SET verified = true
    WHERE id = v_record.id;
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX idx_invite_codes_active ON public.invite_codes(is_active, expires_at);
CREATE INDEX idx_verification_codes_identifier ON public.verification_codes(identifier, type);

-- Create trigger for updated_at
CREATE TRIGGER update_invite_codes_updated_at
  BEFORE UPDATE ON public.invite_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert a few sample invite codes for testing
INSERT INTO public.invite_codes (code, max_uses) VALUES 
('WELCOME1', 100),
('BETA2024', 50),
('TESTCODE', 10);