-- Fix privilege escalation: is_admin() must not rely on profiles.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles ap
    WHERE ap.user_id = auth.uid()
      AND ap.is_active = true
  );
$function$;

-- Defense in depth: prevent setting privileged fields on INSERT into profiles
CREATE OR REPLACE FUNCTION public.prevent_profile_insert_privilege()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.role() = 'service_role' OR public.is_any_admin() THEN
    RETURN NEW;
  END IF;

  -- Force safe defaults on user-initiated inserts
  NEW.role := 'user';
  NEW.is_verified := false;
  NEW.credit_score := COALESCE(NEW.credit_score, 100);
  NEW.ip_address := NULL;
  NEW.user_agent := NULL;
  NEW.ip_country := NULL;
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS prevent_profile_insert_privilege_trg ON public.profiles;
CREATE TRIGGER prevent_profile_insert_privilege_trg
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_insert_privilege();