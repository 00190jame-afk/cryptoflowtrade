-- Fix verification_codes RLS policy to allow proper access
-- Drop the existing broken policy
DROP POLICY IF EXISTS "Users can read their own verification codes" ON public.verification_codes;

-- Create a new policy that allows users to read verification codes for their own email/identifier
-- This assumes the identifier field contains the user's email address
CREATE POLICY "Users can read their own verification codes" 
ON public.verification_codes 
FOR SELECT 
USING (
  -- Allow access if the identifier matches the authenticated user's email
  auth.jwt() ->> 'email' = identifier
  OR
  -- Or if there's a profile with matching email/phone
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.phone = identifier OR auth.jwt() ->> 'email' = identifier)
  )
);

-- Also allow users to update verification attempts/status for their own codes
CREATE POLICY "Users can update their own verification codes" 
ON public.verification_codes 
FOR UPDATE 
USING (
  auth.jwt() ->> 'email' = identifier
  OR
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = auth.uid() 
    AND (p.phone = identifier OR auth.jwt() ->> 'email' = identifier)
  )
);

-- Allow system/edge functions to insert verification codes (for sending codes)
CREATE POLICY "System can insert verification codes" 
ON public.verification_codes 
FOR INSERT 
WITH CHECK (true);

-- Add a cleanup policy for admins to manage expired codes
CREATE POLICY "Admins can manage all verification codes" 
ON public.verification_codes 
FOR ALL 
USING (is_admin());

-- Create an index to improve performance for lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_identifier_type 
ON public.verification_codes (identifier, type, expires_at);