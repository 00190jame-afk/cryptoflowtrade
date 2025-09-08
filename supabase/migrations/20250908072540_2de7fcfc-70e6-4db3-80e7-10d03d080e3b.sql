-- Make cryptographic functions resolvable by functions with restricted search_path
-- Update functions to include extensions schema and explicitly reference gen_random_bytes

-- 1) Recharge code generator
CREATE OR REPLACE FUNCTION public.generate_recharge_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 12-character alphanumeric code using pgcrypto
    new_code := upper(substring(encode(extensions.gen_random_bytes(9), 'base64') from 1 for 12));

    -- Remove potentially confusing characters
    new_code := replace(replace(replace(replace(new_code, '0', 'X'), 'O', 'Y'), 'I', 'Z'), 'L', 'W');

    -- Ensure uniqueness
    SELECT EXISTS(SELECT 1 FROM public.recharge_codes WHERE code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      EXIT;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- 2) Before-insert trigger handler for recharge_codes
CREATE OR REPLACE FUNCTION public.handle_recharge_code_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  IF NEW.code IS NULL OR NEW.code = '' THEN
    NEW.code := public.generate_recharge_code();
  END IF;
  RETURN NEW;
END;
$function$;

-- 3) Keep other utility functions' search_path compatible
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  
  -- Create initial balance for new user
  INSERT INTO public.user_balances (user_id, balance)
  VALUES (NEW.id, 0.00);
  
  RETURN NEW;
END;
$function$;
