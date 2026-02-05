-- Alumni Connect Database Schema

-- Custom types for alumni module
CREATE TYPE alumni_post_type AS ENUM ('update', 'achievement', 'job_posting', 'advice', 'event');
CREATE TYPE alumni_visibility AS ENUM ('public', 'connections', 'private');
CREATE TYPE alumni_reaction_type AS ENUM ('like', 'celebrate', 'insightful', 'support');
CREATE TYPE mentorship_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE group_role AS ENUM ('admin', 'moderator', 'member');

-- 1. Alumni Profiles (extends existing profiles)
CREATE TABLE public.alumni_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  graduation_year INT NOT NULL,
  current_company TEXT,
  current_position TEXT,
  industry TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  available_for_mentorship BOOLEAN DEFAULT false,
  linkedin_url TEXT,
  portfolio_url TEXT,
  bio TEXT,
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Alumni Connections (follow system)
CREATE TABLE public.alumni_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 3. Alumni Posts
CREATE TABLE public.alumni_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  post_type alumni_post_type DEFAULT 'update',
  likes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  visibility alumni_visibility DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Alumni Post Reactions
CREATE TABLE public.alumni_post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.alumni_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type alumni_reaction_type DEFAULT 'like',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 5. Alumni Comments
CREATE TABLE public.alumni_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.alumni_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Alumni Groups
CREATE TABLE public.alumni_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  field TEXT NOT NULL,
  cover_image TEXT,
  member_count INT DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Alumni Group Members
CREATE TABLE public.alumni_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role group_role DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 8. Alumni Group Messages
CREATE TABLE public.alumni_group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.alumni_groups(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Mentorship Requests
CREATE TABLE public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  message TEXT,
  status mentorship_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX idx_alumni_posts_author ON public.alumni_posts(author_id);
CREATE INDEX idx_alumni_posts_created ON public.alumni_posts(created_at DESC);
CREATE INDEX idx_alumni_connections_follower ON public.alumni_connections(follower_id);
CREATE INDEX idx_alumni_connections_following ON public.alumni_connections(following_id);
CREATE INDEX idx_alumni_group_messages_group ON public.alumni_group_messages(group_id);
CREATE INDEX idx_alumni_comments_post ON public.alumni_comments(post_id);
CREATE INDEX idx_alumni_post_reactions_post ON public.alumni_post_reactions(post_id);

-- Function to update likes_count
CREATE OR REPLACE FUNCTION public.update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.alumni_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.alumni_posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update comments_count
CREATE OR REPLACE FUNCTION public.update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.alumni_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.alumni_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to update member_count
CREATE OR REPLACE FUNCTION public.update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.alumni_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.alumni_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers
CREATE TRIGGER trigger_update_likes_count
  AFTER INSERT OR DELETE ON public.alumni_post_reactions
  FOR EACH ROW EXECUTE FUNCTION public.update_post_likes_count();

CREATE TRIGGER trigger_update_comments_count
  AFTER INSERT OR DELETE ON public.alumni_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_post_comments_count();

CREATE TRIGGER trigger_update_member_count
  AFTER INSERT OR DELETE ON public.alumni_group_members
  FOR EACH ROW EXECUTE FUNCTION public.update_group_member_count();

-- Enable RLS on all tables
ALTER TABLE public.alumni_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alumni_group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for alumni_profiles
CREATE POLICY "Alumni profiles are viewable by authenticated users"
  ON public.alumni_profiles FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can create their own alumni profile"
  ON public.alumni_profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alumni profile"
  ON public.alumni_profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for alumni_connections
CREATE POLICY "Connections are viewable by authenticated users"
  ON public.alumni_connections FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can follow others"
  ON public.alumni_connections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow"
  ON public.alumni_connections FOR DELETE
  TO authenticated USING (auth.uid() = follower_id);

-- RLS Policies for alumni_posts
CREATE POLICY "Public posts are viewable by authenticated users"
  ON public.alumni_posts FOR SELECT
  TO authenticated USING (visibility = 'public' OR author_id = auth.uid());

CREATE POLICY "Users can create posts"
  ON public.alumni_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own posts"
  ON public.alumni_posts FOR UPDATE
  TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own posts"
  ON public.alumni_posts FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- RLS Policies for alumni_post_reactions
CREATE POLICY "Reactions are viewable by authenticated users"
  ON public.alumni_post_reactions FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can react to posts"
  ON public.alumni_post_reactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions"
  ON public.alumni_post_reactions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for alumni_comments
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.alumni_comments FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can comment on posts"
  ON public.alumni_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
  ON public.alumni_comments FOR DELETE
  TO authenticated USING (auth.uid() = author_id);

-- RLS Policies for alumni_groups
CREATE POLICY "Groups are viewable by authenticated users"
  ON public.alumni_groups FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can create groups"
  ON public.alumni_groups FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Group creators can update groups"
  ON public.alumni_groups FOR UPDATE
  TO authenticated USING (auth.uid() = created_by);

-- RLS Policies for alumni_group_members
CREATE POLICY "Group members are viewable by authenticated users"
  ON public.alumni_group_members FOR SELECT
  TO authenticated USING (true);

CREATE POLICY "Users can join groups"
  ON public.alumni_group_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave groups"
  ON public.alumni_group_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for alumni_group_messages
CREATE POLICY "Group messages viewable by group members"
  ON public.alumni_group_messages FOR SELECT
  TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_group_messages.group_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Group members can send messages"
  ON public.alumni_group_messages FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.alumni_group_members
      WHERE group_id = alumni_group_messages.group_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for mentorship_requests
CREATE POLICY "Users can view their mentorship requests"
  ON public.mentorship_requests FOR SELECT
  TO authenticated USING (auth.uid() = mentee_id OR auth.uid() = mentor_id);

CREATE POLICY "Users can create mentorship requests"
  ON public.mentorship_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors can update request status"
  ON public.mentorship_requests FOR UPDATE
  TO authenticated USING (auth.uid() = mentor_id);

-- Enable realtime for posts, reactions, comments, and group messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_post_reactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.alumni_group_messages;