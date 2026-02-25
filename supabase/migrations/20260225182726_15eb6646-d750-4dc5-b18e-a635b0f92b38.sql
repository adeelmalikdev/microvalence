
CREATE TABLE public.security_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  question_1 text NOT NULL,
  answer_1 text NOT NULL,
  question_2 text NOT NULL,
  answer_2 text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own security questions"
  ON public.security_questions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own security questions"
  ON public.security_questions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own security questions"
  ON public.security_questions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own security questions"
  ON public.security_questions FOR DELETE
  USING (auth.uid() = user_id);
