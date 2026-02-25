
-- 1. Group admin controls: add settings columns to alumni_groups
ALTER TABLE public.alumni_groups ADD COLUMN join_mode text NOT NULL DEFAULT 'open';
ALTER TABLE public.alumni_groups ADD COLUMN admin_only_messaging boolean NOT NULL DEFAULT false;

-- 2. Pinned messages in group chats
ALTER TABLE public.alumni_group_messages ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- 3. Join requests table
CREATE TABLE public.alumni_group_join_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.alumni_group_join_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create join requests" ON public.alumni_group_join_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Requesters can view own requests" ON public.alumni_group_join_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Group admins can view requests" ON public.alumni_group_join_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_group_join_requests.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

CREATE POLICY "Group admins can update requests" ON public.alumni_group_join_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_group_join_requests.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 4. Allow group admins to delete any message in their group
CREATE POLICY "Group admins can delete messages" ON public.alumni_group_messages
  FOR DELETE USING (
    auth.uid() = sender_id OR
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_group_messages.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 5. Allow group admins to update messages (for pinning)
CREATE POLICY "Group admins can update messages" ON public.alumni_group_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_group_messages.group_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 6. Allow admins to update member roles  
CREATE POLICY "Group admins can update members" ON public.alumni_group_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.alumni_group_members AS m
      WHERE m.group_id = alumni_group_members.group_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

-- 7. Update existing DELETE policy on alumni_group_members to also allow admin kicks
DROP POLICY IF EXISTS "Users can leave groups" ON public.alumni_group_members;
CREATE POLICY "Members can leave or admins can remove" ON public.alumni_group_members
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.alumni_group_members AS m
      WHERE m.group_id = alumni_group_members.group_id
      AND m.user_id = auth.uid()
      AND m.role = 'admin'
    )
  );

-- 8. Allow group admins to update group settings
DROP POLICY IF EXISTS "Group creators can update groups" ON public.alumni_groups;
CREATE POLICY "Group admins can update groups" ON public.alumni_groups
  FOR UPDATE USING (
    auth.uid() = created_by OR
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_groups.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- 9. Polls table (works for both group chats and DMs)
CREATE TABLE public.polls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL DEFAULT '[]',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  ends_at timestamptz
);
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.poll_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id uuid NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  option_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(poll_id, user_id)
);
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls RLS
CREATE POLICY "Group members can view group polls" ON public.polls
  FOR SELECT USING (
    (group_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = polls.group_id AND user_id = auth.uid()
    )) OR
    (conversation_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = polls.conversation_id
      AND (student_id = auth.uid() OR recruiter_id = auth.uid())
    ))
  );

CREATE POLICY "Users can create polls" ON public.polls
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update polls" ON public.polls
  FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete polls" ON public.polls
  FOR DELETE USING (auth.uid() = creator_id);

-- Poll votes RLS
CREATE POLICY "Participants can view votes" ON public.poll_votes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.polls p
      WHERE p.id = poll_votes.poll_id
      AND (
        (p.group_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.alumni_group_members
          WHERE group_id = p.group_id AND user_id = auth.uid()
        )) OR
        (p.conversation_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.conversations
          WHERE id = p.conversation_id
          AND (student_id = auth.uid() OR recruiter_id = auth.uid())
        ))
      )
    )
  );

CREATE POLICY "Users can vote" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change vote" ON public.poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- 10. DM features: add media_url and is_pinned to messages
ALTER TABLE public.messages ADD COLUMN media_url text;
ALTER TABLE public.messages ADD COLUMN is_pinned boolean NOT NULL DEFAULT false;

-- Enable realtime for polls
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_group_join_requests;
