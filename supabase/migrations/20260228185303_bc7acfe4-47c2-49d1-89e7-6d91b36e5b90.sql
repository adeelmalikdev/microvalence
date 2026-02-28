-- Fix: Allow students to update their submissions when status is 'needs_revision' (not just 'pending')
DROP POLICY IF EXISTS "Students can update their submissions" ON public.task_submissions;

CREATE POLICY "Students can update their submissions"
ON public.task_submissions
FOR UPDATE
TO authenticated
USING (
  (student_id = auth.uid()) AND (status IN ('pending', 'needs_revision'))
)
WITH CHECK (
  student_id = auth.uid()
);