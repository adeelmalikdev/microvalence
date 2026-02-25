
-- 1. Add filled column to opportunities
ALTER TABLE public.opportunities ADD COLUMN IF NOT EXISTS filled boolean NOT NULL DEFAULT false;

-- 2. Create trigger function: when application is accepted/in_progress, mark opportunity filled and reject other pending apps
CREATE OR REPLACE FUNCTION public.handle_application_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF (NEW.status IN ('accepted', 'in_progress') AND OLD.status = 'pending') THEN
    -- Mark opportunity as filled
    UPDATE public.opportunities
    SET filled = true
    WHERE id = NEW.opportunity_id;

    -- Auto-reject all other pending applications for this opportunity
    UPDATE public.applications
    SET status = 'rejected', updated_at = now()
    WHERE opportunity_id = NEW.opportunity_id
      AND id != NEW.id
      AND status = 'pending';
  END IF;
  RETURN NEW;
END;
$$;

-- 3. Create trigger
DROP TRIGGER IF EXISTS on_application_accepted ON public.applications;
CREATE TRIGGER on_application_accepted
  AFTER UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_application_accepted();

-- 4. Update applications INSERT RLS policy to block inserts on filled opportunities
DROP POLICY IF EXISTS "Students can create applications" ON public.applications;
CREATE POLICY "Students can create applications"
  ON public.applications
  FOR INSERT
  WITH CHECK (
    (student_id = auth.uid())
    AND has_role(auth.uid(), 'student'::app_role)
    AND NOT EXISTS (
      SELECT 1 FROM public.opportunities
      WHERE id = opportunity_id AND filled = true
    )
  );
