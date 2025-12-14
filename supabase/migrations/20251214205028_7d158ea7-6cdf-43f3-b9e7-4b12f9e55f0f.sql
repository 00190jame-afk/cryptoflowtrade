-- Remove unused profile columns
ALTER TABLE public.profiles 
  DROP COLUMN IF EXISTS date_of_birth,
  DROP COLUMN IF EXISTS address,
  DROP COLUMN IF EXISTS city,
  DROP COLUMN IF EXISTS country,
  DROP COLUMN IF EXISTS postal_code;

-- Add IP-based country column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ip_country text;