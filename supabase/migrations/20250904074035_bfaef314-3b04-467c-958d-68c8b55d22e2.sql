-- Tighten RLS on user_balances to prevent unauthorized manipulation

-- 1) Remove overly permissive policy
DROP POLICY IF EXISTS "System can manage balances" ON public.user_balances;

-- 2) Ensure RLS is enabled (idempotent)
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- 3) Admins can manage all balances (insert/update/delete/select)
-- Uses existing profiles table role column
CREATE POLICY "Admins can manage all balances"
ON public.user_balances
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
  )
);
