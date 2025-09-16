-- Create admin profiles table
CREATE TABLE public.admin_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_invite_codes TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  description TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin invite codes table
CREATE TABLE public.admin_invite_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  created_by UUID,
  used_by UUID,
  role TEXT NOT NULL DEFAULT 'admin',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_invite_codes ENABLE ROW LEVEL SECURITY;

-- Create admin role check function
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid() 
      AND ap.role = 'super_admin' 
      AND ap.is_active = true
  );
$$;

-- Create function to check if user is any admin
CREATE OR REPLACE FUNCTION public.is_any_admin()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid() 
      AND ap.is_active = true
  );
$$;

-- Create function to get admin's assigned users
CREATE OR REPLACE FUNCTION public.get_admin_assigned_users(p_admin_user_id UUID)
RETURNS TABLE(user_id UUID)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ic.used_by as user_id
  FROM public.invite_codes ic
  JOIN public.admin_profiles ap ON ap.user_id = p_admin_user_id
  WHERE ic.code = ANY(ap.assigned_invite_codes)
    AND ic.used_by IS NOT NULL;
$$;

-- RLS Policies for admin_profiles
CREATE POLICY "Super admins can manage all admin profiles"
ON public.admin_profiles FOR ALL
USING (is_super_admin());

CREATE POLICY "Admins can view their own profile"
ON public.admin_profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can update their own profile"
ON public.admin_profiles FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for audit_logs
CREATE POLICY "Super admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (is_super_admin());

CREATE POLICY "Admins can view their own audit logs"
ON public.audit_logs FOR SELECT
USING (auth.uid() = admin_id);

CREATE POLICY "Admins can create audit logs"
ON public.audit_logs FOR INSERT
WITH CHECK (auth.uid() = admin_id);

-- RLS Policies for admin_invite_codes
CREATE POLICY "Super admins can manage all admin invite codes"
ON public.admin_invite_codes FOR ALL
USING (is_super_admin());

CREATE POLICY "Anyone can validate admin invite codes"
ON public.admin_invite_codes FOR SELECT
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Update existing tables for admin access
-- Admins can view users based on invite codes
CREATE POLICY "Admins can view their assigned users"
ON public.profiles FOR SELECT
USING (
  is_super_admin() OR 
  (is_any_admin() AND user_id IN (
    SELECT user_id FROM get_admin_assigned_users(auth.uid())
  ))
);

-- Similar policies for other user-related tables
CREATE POLICY "Admins can view assigned user balances"
ON public.user_balances FOR SELECT
USING (
  is_super_admin() OR 
  (is_any_admin() AND user_id IN (
    SELECT user_id FROM get_admin_assigned_users(auth.uid())
  ))
);

CREATE POLICY "Admins can view assigned user trades"
ON public.trades FOR SELECT
USING (
  is_super_admin() OR 
  (is_any_admin() AND user_id IN (
    SELECT user_id FROM get_admin_assigned_users(auth.uid())
  ))
);

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action_type TEXT,
  p_target_type TEXT,
  p_target_id UUID,
  p_description TEXT,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.audit_logs (
    admin_id,
    action_type,
    target_type,
    target_id,
    description,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    p_action_type,
    p_target_type,
    p_target_id,
    p_description,
    p_old_values,
    p_new_values
  );
END;
$$;

-- Add trigger for admin profile updates
CREATE OR REPLACE FUNCTION public.update_admin_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_updated_at();