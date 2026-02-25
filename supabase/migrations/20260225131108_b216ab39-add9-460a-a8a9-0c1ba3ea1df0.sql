
-- Add unique constraint to prevent future duplicate conversations per student-recruiter pair
CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique_pair ON public.conversations (student_id, recruiter_id);

-- Add UPDATE policy so the trigger can update existing conversations
CREATE POLICY "System can update conversations"
ON public.conversations FOR UPDATE
USING (student_id = auth.uid() OR recruiter_id = auth.uid());

-- Add pin and block columns to conversations
ALTER TABLE public.conversations
ADD COLUMN IF NOT EXISTS is_pinned_student boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_pinned_recruiter boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_blocked_by_student boolean NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS is_blocked_by_recruiter boolean NOT NULL DEFAULT false;
