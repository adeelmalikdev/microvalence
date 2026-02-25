
CREATE OR REPLACE FUNCTION public.get_student_portfolio(_student_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result jsonb;
BEGIN
  -- Only allow authenticated users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT jsonb_build_object(
    'internships', COALESCE((
      SELECT jsonb_agg(jsonb_build_object(
        'id', a.id,
        'opportunityTitle', o.title,
        'companyName', o.company_name,
        'completedAt', a.updated_at,
        'durationHours', o.duration_hours,
        'skills', COALESCE(
          (SELECT f.skills_demonstrated FROM feedback f WHERE f.application_id = a.id LIMIT 1),
          o.skills_required
        ),
        'rating', (SELECT f.rating FROM feedback f WHERE f.application_id = a.id LIMIT 1),
        'feedback', (SELECT f.comments FROM feedback f WHERE f.application_id = a.id LIMIT 1),
        'certificateId', (SELECT c.id FROM certificates c WHERE c.application_id = a.id LIMIT 1),
        'verificationCode', (SELECT c.verification_code FROM certificates c WHERE c.application_id = a.id LIMIT 1)
      ))
      FROM applications a
      JOIN opportunities o ON o.id = a.opportunity_id
      WHERE a.student_id = _student_id
        AND a.status = 'completed'
    ), '[]'::jsonb)
  ) INTO result;

  RETURN result;
END;
$function$;
