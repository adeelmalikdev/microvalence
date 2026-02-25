-- Fix: Update opportunities that have completed applications to be marked as filled
UPDATE opportunities
SET filled = true
WHERE id IN (
  SELECT DISTINCT opportunity_id 
  FROM applications 
  WHERE status IN ('accepted', 'in_progress', 'completed')
)
AND filled = false;

-- Update trigger to also handle completed status
CREATE OR REPLACE FUNCTION public.handle_application_accepted()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (NEW.status IN ('accepted', 'in_progress', 'completed') AND OLD.status IN ('pending', 'accepted', 'in_progress')) THEN
    UPDATE public.opportunities
    SET filled = true
    WHERE id = NEW.opportunity_id;

    -- Auto-reject all other pending applications for this opportunity
    IF OLD.status = 'pending' THEN
      UPDATE public.applications
      SET status = 'rejected', updated_at = now()
      WHERE opportunity_id = NEW.opportunity_id
        AND id != NEW.id
        AND status = 'pending';
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;