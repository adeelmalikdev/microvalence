-- Ensure alumni status is always derived from profile status
CREATE OR REPLACE FUNCTION public.update_alumni_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.is_alumni := (NEW.status = 'graduated');
  RETURN NEW;
END;
$$;

-- Attach trigger to keep is_alumni synced on inserts/updates
DROP TRIGGER IF EXISTS profiles_update_alumni_status ON public.profiles;
CREATE TRIGGER profiles_update_alumni_status
BEFORE INSERT OR UPDATE OF status ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_alumni_status();