
-- Bug 1: Fix duplicate conversations by updating the trigger
-- Check for existing conversation between same student and recruiter before creating
CREATE OR REPLACE FUNCTION public.create_conversation_on_accept()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_recruiter_id uuid;
  v_existing_id uuid;
BEGIN
  IF (NEW.status IN ('accepted', 'in_progress') AND OLD.status = 'pending') THEN
    -- Get the recruiter for this opportunity
    SELECT recruiter_id INTO v_recruiter_id
    FROM public.opportunities
    WHERE id = NEW.opportunity_id;

    -- Check if a conversation already exists between this student and recruiter
    SELECT id INTO v_existing_id
    FROM public.conversations
    WHERE student_id = NEW.student_id
      AND recruiter_id = v_recruiter_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      -- Reuse existing conversation: update its application_id to the latest accepted one
      UPDATE public.conversations
      SET application_id = NEW.id, updated_at = now()
      WHERE id = v_existing_id;
    ELSE
      -- No existing conversation, create a new one
      INSERT INTO public.conversations (application_id, student_id, recruiter_id)
      VALUES (NEW.id, NEW.student_id, v_recruiter_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$function$;

-- Bug 3: Enable realtime for messages table so subscriptions work
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
