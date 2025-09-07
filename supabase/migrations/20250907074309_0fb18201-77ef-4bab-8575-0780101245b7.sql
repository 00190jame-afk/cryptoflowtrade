-- Create recharge_codes table
CREATE TABLE public.recharge_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'unused' CHECK (status IN ('unused', 'redeemed')),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recharge_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage all recharge codes" 
ON public.recharge_codes 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Users can view their own redeemed codes" 
ON public.recharge_codes 
FOR SELECT 
USING (auth.uid() = user_id AND status = 'redeemed');

-- Create function to generate unique recharge code
CREATE OR REPLACE FUNCTION public.generate_recharge_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 12-character alphanumeric code
    new_code := upper(substring(encode(gen_random_bytes(9), 'base64') from 1 for 12));
    -- Remove potentially confusing characters
    new_code := replace(replace(replace(replace(new_code, '0', 'X'), 'O', 'Y'), 'I', 'Z'), 'L', 'W');
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.recharge_codes WHERE code = new_code) INTO code_exists;
    
    -- If code doesn't exist, we can use it
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Create trigger function to auto-generate code
CREATE OR REPLACE FUNCTION public.handle_recharge_code_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only generate code if not provided
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_recharge_code();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER generate_recharge_code_trigger
  BEFORE INSERT ON public.recharge_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_recharge_code_insert();

-- Add trigger for updated_at
CREATE TRIGGER update_recharge_codes_updated_at
  BEFORE UPDATE ON public.recharge_codes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();