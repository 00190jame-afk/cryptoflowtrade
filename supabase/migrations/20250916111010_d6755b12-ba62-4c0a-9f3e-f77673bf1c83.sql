-- Add email column only to tables that don't have it yet
-- Check and add to user_balances if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_balances' AND column_name = 'email') THEN
        ALTER TABLE public.user_balances ADD COLUMN email TEXT;
    END IF;
END $$;

-- Check and add to transactions if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'transactions' AND column_name = 'email') THEN
        ALTER TABLE public.transactions ADD COLUMN email TEXT;
    END IF;
END $$;

-- Check and add to trades if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'trades' AND column_name = 'email') THEN
        ALTER TABLE public.trades ADD COLUMN email TEXT;
    END IF;
END $$;

-- Check and add to profiles if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
    END IF;
END $$;

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

-- Create triggers only if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'populate_user_balances_email') THEN
        CREATE TRIGGER populate_user_balances_email
          BEFORE INSERT ON public.user_balances
          FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'populate_transactions_email') THEN
        CREATE TRIGGER populate_transactions_email
          BEFORE INSERT ON public.transactions
          FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'populate_trades_email') THEN
        CREATE TRIGGER populate_trades_email
          BEFORE INSERT ON public.trades
          FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'populate_profiles_email') THEN
        CREATE TRIGGER populate_profiles_email
          BEFORE INSERT ON public.profiles
          FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'populate_withdraw_requests_email') THEN
        CREATE TRIGGER populate_withdraw_requests_email
          BEFORE INSERT ON public.withdraw_requests
          FOR EACH ROW EXECUTE FUNCTION public.populate_user_email();
    END IF;
END $$;

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