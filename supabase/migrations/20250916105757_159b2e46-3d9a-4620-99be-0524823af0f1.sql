-- Add email column to withdraw_requests table
ALTER TABLE public.withdraw_requests ADD COLUMN email TEXT;

-- Add email column to user_balances table  
ALTER TABLE public.user_balances ADD COLUMN email TEXT;

-- Add email column to transactions table
ALTER TABLE public.transactions ADD COLUMN email TEXT;

-- Add email column to trades table
ALTER TABLE public.trades ADD COLUMN email TEXT;

-- Add email column to profiles table
ALTER TABLE public.profiles ADD COLUMN email TEXT;

-- Create function to automatically populate email from auth.users
CREATE OR REPLACE FUNCTION public.populate_user_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Get email from auth.users table
  SELECT email INTO NEW.email 
  FROM auth.users 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers to automatically populate email on insert
CREATE TRIGGER populate_withdraw_requests_email
  BEFORE INSERT ON public.withdraw_requests
  FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();

CREATE TRIGGER populate_user_balances_email
  BEFORE INSERT ON public.user_balances
  FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();

CREATE TRIGGER populate_transactions_email
  BEFORE INSERT ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();

CREATE TRIGGER populate_trades_email
  BEFORE INSERT ON public.trades
  FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();

CREATE TRIGGER populate_profiles_email
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();

-- Update existing records with email addresses
UPDATE public.withdraw_requests 
SET email = (SELECT email FROM auth.users WHERE id = withdraw_requests.user_id)
WHERE email IS NULL;

UPDATE public.user_balances 
SET email = (SELECT email FROM auth.users WHERE id = user_balances.user_id)
WHERE email IS NULL;

UPDATE public.transactions 
SET email = (SELECT email FROM auth.users WHERE id = transactions.user_id)
WHERE email IS NULL;

UPDATE public.trades 
SET email = (SELECT email FROM auth.users WHERE id = trades.user_id)
WHERE email IS NULL;

UPDATE public.profiles 
SET email = (SELECT email FROM auth.users WHERE id = profiles.user_id)
WHERE email IS NULL;