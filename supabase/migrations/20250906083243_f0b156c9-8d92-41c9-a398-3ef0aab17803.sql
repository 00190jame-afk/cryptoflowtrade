-- Create a SECURITY DEFINER helper to avoid recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid() AND p.role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO PUBLIC;

-- Fix profiles policies to avoid self-referencing queries
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "admin_all_profiles_update" ON public.profiles;

-- Admins can select/update any profile via function (no recursion)
CREATE POLICY "admin_all_profiles_select"
ON public.profiles
FOR SELECT
USING (public.is_admin());

CREATE POLICY "admin_all_profiles_update"
ON public.profiles
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Optional: allow admins to insert/delete profiles if needed (kept tight for now)
-- Uncomment if required later
-- CREATE POLICY "admin_all_profiles_insert" ON public.profiles FOR INSERT WITH CHECK (public.is_admin());
-- CREATE POLICY "admin_all_profiles_delete" ON public.profiles FOR DELETE USING (public.is_admin());

-- Replace admin policies on user_balances to use the helper (removes dependency on profiles inside policy eval)
DROP POLICY IF EXISTS "Admins can manage all balances" ON public.user_balances;
DROP POLICY IF EXISTS "Admins can manage balances" ON public.user_balances;
DROP POLICY IF EXISTS "admin_all_user_balances" ON public.user_balances;

CREATE POLICY "admin_all_user_balances"
ON public.user_balances
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Replace admin policies on transactions to use the helper as well
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
DROP POLICY IF EXISTS "admin_all_transactions" ON public.transactions;

CREATE POLICY "admin_all_transactions"
ON public.transactions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());