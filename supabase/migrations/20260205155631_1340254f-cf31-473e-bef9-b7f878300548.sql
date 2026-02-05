-- Fix: Add DELETE policy for conversations table
CREATE POLICY "Participants can delete their conversations" 
ON public.conversations 
FOR DELETE 
USING (student_id = auth.uid() OR recruiter_id = auth.uid());

-- Fix: Create persistent rate_limits table for rate limiting
CREATE TABLE public.rate_limits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for efficient lookups and cleanup
CREATE INDEX idx_rate_limits_key ON public.rate_limits(key);
CREATE INDEX idx_rate_limits_reset_at ON public.rate_limits(reset_at);

-- Enable RLS on rate_limits (only service role should access this)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access rate_limits table
-- This ensures rate limiting cannot be bypassed by authenticated users

-- Add a function to clean up expired rate limits (can be called periodically)
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.rate_limits WHERE reset_at < now();
END;
$$;