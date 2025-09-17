-- Fix critical security vulnerability: Remove public access to admin invite codes
-- This prevents hackers from stealing admin invitation codes

-- Drop the dangerous public read policy
DROP POLICY IF EXISTS "Anyone can validate admin invite codes" ON public.admin_invite_codes;

-- Keep only the super admin management policy (this is secure)
-- The existing policy "Super admins can manage all admin invite codes" remains unchanged

-- The register_admin_with_invite function will still work because it uses SECURITY DEFINER
-- which allows it to bypass RLS policies with elevated privileges