
-- Fix existing applications where all tasks are already approved but app isn't completed
UPDATE applications a
SET status = 'completed', updated_at = now()
WHERE a.status IN ('accepted', 'in_progress')
AND NOT EXISTS (
  -- Check there are tasks for this opportunity
  SELECT 1 FROM tasks t 
  JOIN opportunities o ON o.id = t.opportunity_id
  WHERE o.id = a.opportunity_id
  HAVING COUNT(t.id) = 0
)
AND EXISTS (
  SELECT 1 FROM tasks t WHERE t.opportunity_id = a.opportunity_id
)
AND (
  SELECT COUNT(DISTINCT t2.id) 
  FROM tasks t2 
  WHERE t2.opportunity_id = a.opportunity_id
) = (
  SELECT COUNT(DISTINCT ts.task_id)
  FROM task_submissions ts
  JOIN tasks t3 ON t3.id = ts.task_id
  WHERE t3.opportunity_id = a.opportunity_id
    AND ts.application_id = a.id
    AND ts.status = 'approved'
);
