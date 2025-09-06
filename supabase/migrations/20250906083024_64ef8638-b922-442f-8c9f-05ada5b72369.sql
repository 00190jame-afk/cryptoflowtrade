-- Fix infinite recursion in RLS policies by removing circular dependencies

-- Drop the problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all balances" ON public.user_balances;
DROP POLICY IF EXISTS "Admins can manage balances" ON public.user_balances;

-- Recreate simpler admin policies without recursion
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT user_id FROM public.profiles 
    WHERE role = 'admin' AND user_id = auth.uid()
  ) 
  OR auth.uid() = user_id
);

-- Create a simple admin policy for user_balances without circular dependency
CREATE POLICY "Admins can manage all balances" 
ON public.user_balances 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
    LIMIT 1
  ) 
  OR auth.uid() = user_balances.user_id
);

-- Create a simple policy for transactions as well to prevent similar issues
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" 
ON public.transactions 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
    LIMIT 1
  ) 
  OR auth.uid() = transactions.user_id
);