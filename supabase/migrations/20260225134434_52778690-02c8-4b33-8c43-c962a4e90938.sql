
-- Allow message participants to update is_pinned on messages
-- The existing UPDATE policy only allows recipients to mark read_at
-- We need to also allow pinning by either participant
DROP POLICY IF EXISTS "Recipients can mark messages read" ON public.messages;

CREATE POLICY "Participants can update messages" ON public.messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.student_id = auth.uid() OR c.recruiter_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (c.student_id = auth.uid() OR c.recruiter_id = auth.uid())
    )
  );
