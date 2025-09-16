-- Create function to register admin with invite code (bypasses RLS)
CREATE OR REPLACE FUNCTION public.register_admin_with_invite(
  p_email text,
  p_user_id uuid,
  p_full_name text,
  p_admin_invite_code text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite_code RECORD;
  v_result jsonb;
BEGIN
  -- Validate the admin invite code
  SELECT * INTO v_invite_code
  FROM public.admin_invite_codes
  WHERE code = trim(upper(p_admin_invite_code))
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND used_by IS NULL;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired admin invite code');
  END IF;

  -- Create admin profile with elevated privileges
  INSERT INTO public.admin_profiles (
    user_id,
    email,
    full_name,
    role,
    is_active,
    assigned_invite_codes
  ) VALUES (
    p_user_id,
    p_email,
    p_full_name,
    v_invite_code.role,
    true,
    ARRAY[]::text[]
  );

  -- Mark invite code as used
  UPDATE public.admin_invite_codes
  SET 
    used_by = p_user_id,
    used_at = now()
  WHERE id = v_invite_code.id;

  -- Return success
  RETURN jsonb_build_object(
    'success', true, 
    'role', v_invite_code.role,
    'message', 'Admin profile created successfully'
  );

EXCEPTION WHEN OTHERS THEN
  -- Return error details
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'detail', SQLSTATE
  );
END;
$$;