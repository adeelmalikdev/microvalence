
-- Auto-complete application when all tasks are approved
CREATE OR REPLACE FUNCTION public.auto_complete_application_on_all_tasks_approved()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_opportunity_id uuid;
  v_total_tasks integer;
  v_approved_tasks integer;
BEGIN
  -- Only act when a submission is approved
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- Get the opportunity_id from the task
    SELECT t.opportunity_id INTO v_opportunity_id
    FROM tasks t
    WHERE t.id = NEW.task_id;

    IF v_opportunity_id IS NULL THEN
      RETURN NEW;
    END IF;

    -- Count total tasks for this opportunity
    SELECT COUNT(*) INTO v_total_tasks
    FROM tasks
    WHERE opportunity_id = v_opportunity_id;

    -- Count approved submissions for this student + application
    SELECT COUNT(DISTINCT ts.task_id) INTO v_approved_tasks
    FROM task_submissions ts
    JOIN tasks t ON t.id = ts.task_id
    WHERE t.opportunity_id = v_opportunity_id
      AND ts.application_id = NEW.application_id
      AND ts.status = 'approved';

    -- If all tasks are approved, mark application as completed
    IF v_approved_tasks >= v_total_tasks AND v_total_tasks > 0 THEN
      UPDATE applications
      SET status = 'completed', updated_at = now()
      WHERE id = NEW.application_id
        AND status IN ('accepted', 'in_progress');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_auto_complete_on_task_approved ON task_submissions;
CREATE TRIGGER trigger_auto_complete_on_task_approved
  AFTER UPDATE ON task_submissions
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_application_on_all_tasks_approved();
