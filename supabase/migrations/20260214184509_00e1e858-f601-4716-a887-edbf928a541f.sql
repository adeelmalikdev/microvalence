
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  _role app_role;
BEGIN
  -- Get requested role from user metadata
  _role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'student'::app_role
  );

  -- SECURITY: Block admin role from signup - only allow student or recruiter
  IF _role NOT IN ('student'::app_role, 'recruiter'::app_role) THEN
    _role := 'student'::app_role;
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );

  -- Assign validated role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, _role);

  RETURN NEW;
END;
$function$;
