-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.generate_recharge_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Fix trigger function with proper search_path
CREATE OR REPLACE FUNCTION public.handle_recharge_code_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only generate code if not provided
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_recharge_code();
  END IF;
  
  RETURN NEW;
END;
$$;