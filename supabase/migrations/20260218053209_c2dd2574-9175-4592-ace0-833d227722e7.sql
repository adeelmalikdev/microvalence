-- Create a security definer function to get user IDs by role (for browsing)
CREATE OR REPLACE FUNCTION public.get_users_by_role(_role app_role)
RETURNS SETOF uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_id FROM public.user_roles WHERE role = _role
$$;