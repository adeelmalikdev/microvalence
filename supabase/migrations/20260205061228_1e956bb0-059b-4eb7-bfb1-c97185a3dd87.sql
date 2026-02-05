-- Create achievements table (master list of all achievements)
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '🏆',
  points INTEGER NOT NULL DEFAULT 10,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  criteria_type TEXT NOT NULL,
  criteria_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table (tracks which users unlocked which achievements)
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create user_gamification table (tracks XP, level, streaks)
CREATE TABLE public.user_gamification (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_gamification ENABLE ROW LEVEL SECURITY;

-- Achievements are publicly viewable
CREATE POLICY "Achievements are publicly viewable"
ON public.achievements
FOR SELECT
USING (true);

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

-- System can insert user achievements
CREATE POLICY "System can insert user achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own gamification stats
CREATE POLICY "Users can view their own gamification stats"
ON public.user_gamification
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own gamification record
CREATE POLICY "Users can insert their own gamification"
ON public.user_gamification
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own gamification stats
CREATE POLICY "Users can update their own gamification"
ON public.user_gamification
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON public.user_gamification
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.achievements (slug, title, description, icon, points, rarity, criteria_type, criteria_value) VALUES
-- Application achievements
('first_application', 'Getting Started', 'Submit your first application', '🎯', 10, 'common', 'applications_count', 1),
('application_spree', 'Application Spree', 'Submit 5 applications', '📝', 25, 'uncommon', 'applications_count', 5),
('persistent_applicant', 'Persistent Applicant', 'Submit 10 applications', '💪', 50, 'rare', 'applications_count', 10),
('application_master', 'Application Master', 'Submit 25 applications', '🏅', 100, 'epic', 'applications_count', 25),

-- Acceptance achievements
('first_acceptance', 'First Win', 'Get your first application accepted', '🎉', 50, 'uncommon', 'accepted_count', 1),
('rising_star', 'Rising Star', 'Get 3 applications accepted', '⭐', 100, 'rare', 'accepted_count', 3),
('in_demand', 'In Demand', 'Get 5 applications accepted', '🌟', 200, 'epic', 'accepted_count', 5),

-- Task achievements
('task_starter', 'Task Starter', 'Complete your first task', '✅', 15, 'common', 'tasks_completed', 1),
('task_champion', 'Task Champion', 'Complete 10 tasks', '🏆', 75, 'rare', 'tasks_completed', 10),
('task_legend', 'Task Legend', 'Complete 25 tasks', '👑', 150, 'epic', 'tasks_completed', 25),

-- Profile achievements
('profile_complete', 'Profile Pro', 'Complete your profile with all details', '📋', 20, 'common', 'profile_complete', 1),
('avatar_added', 'Picture Perfect', 'Add a profile photo', '📸', 10, 'common', 'has_avatar', 1),

-- Speed achievements
('speedrunner', 'Speedrunner', 'Get accepted within 7 days of first application', '⚡', 150, 'legendary', 'days_to_first_acceptance', 7),
('quick_starter', 'Quick Starter', 'Apply to an opportunity within 24 hours of signing up', '🚀', 25, 'uncommon', 'hours_to_first_application', 24),

-- Engagement achievements
('early_bird', 'Early Bird', 'Log in 5 days in a row', '🐦', 30, 'uncommon', 'streak_days', 5),
('dedicated', 'Dedicated', 'Log in 14 days in a row', '🔥', 75, 'rare', 'streak_days', 14),
('committed', 'Committed', 'Log in 30 days in a row', '💎', 200, 'legendary', 'streak_days', 30),

-- Message achievements
('first_message', 'Conversation Starter', 'Send your first message to a recruiter', '💬', 15, 'common', 'messages_sent', 1),
('communicator', 'Great Communicator', 'Send 25 messages', '🗣️', 50, 'rare', 'messages_sent', 25),

-- Completion achievements
('first_completion', 'Mission Complete', 'Complete your first internship', '🎓', 200, 'epic', 'completed_count', 1),
('intern_veteran', 'Intern Veteran', 'Complete 3 internships', '🏛️', 500, 'legendary', 'completed_count', 3);

-- Create indexes for performance
CREATE INDEX idx_user_achievements_user ON public.user_achievements(user_id);
CREATE INDEX idx_user_gamification_user ON public.user_gamification(user_id);
CREATE INDEX idx_achievements_criteria ON public.achievements(criteria_type);