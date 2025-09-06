-- Add on_hold and frozen columns to user_balances table
ALTER TABLE public.user_balances 
ADD COLUMN IF NOT EXISTS on_hold NUMERIC DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS frozen NUMERIC DEFAULT 0.00;

-- Update existing records to have default values
UPDATE public.user_balances 
SET on_hold = 0.00, frozen = 0.00 
WHERE on_hold IS NULL OR frozen IS NULL;