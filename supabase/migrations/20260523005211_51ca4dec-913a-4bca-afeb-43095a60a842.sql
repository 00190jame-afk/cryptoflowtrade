-- Update the function to also restrict IP/tracking fields for admins (only service role may write them)
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- IP/tracking fields: only the service role (edge functions) may modify
  IF (NEW.ip_address IS DISTINCT FROM OLD.ip_address
      OR NEW.user_agent IS DISTINCT FROM OLD.user_agent
      OR NEW.ip_country IS DISTINCT FROM OLD.ip_country)
     AND auth.role() <> 'service_role' THEN
    RAISE EXCEPTION 'Not authorized to change tracking fields';
  END IF;

  -- Admins may legitimately change role/verification/credit_score/invite linkage
  IF public.is_any_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Not authorized to change role';
  END IF;
  IF NEW.credit_score IS DISTINCT FROM OLD.credit_score THEN
    RAISE EXCEPTION 'Not authorized to change credit_score';
  END IF;
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified THEN
    RAISE EXCEPTION 'Not authorized to change is_verified';
  END IF;
  IF NEW.registered_with_invite_code_id IS DISTINCT FROM OLD.registered_with_invite_code_id THEN
    RAISE EXCEPTION 'Not authorized to change invite code linkage';
  END IF;

  RETURN NEW;
END;
$$;

-- Install the trigger (it was missing)
DROP TRIGGER IF EXISTS prevent_profile_privilege_escalation_trg ON public.profiles;
CREATE TRIGGER prevent_profile_privilege_escalation_trg
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();