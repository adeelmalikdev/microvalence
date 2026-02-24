
-- Add is_alumni boolean flag to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_alumni BOOLEAN DEFAULT FALSE;

-- Create function to auto-update alumni status
CREATE OR REPLACE FUNCTION update_alumni_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'graduated' THEN
    NEW.is_alumni := TRUE;
  ELSIF OLD IS NOT NULL AND OLD.status = 'graduated' AND NEW.status != 'graduated' THEN
    NEW.is_alumni := FALSE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger
DROP TRIGGER IF EXISTS auto_alumni_status ON profiles;
CREATE TRIGGER auto_alumni_status
  BEFORE INSERT OR UPDATE OF status ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_alumni_status();

-- Backfill existing graduated students
UPDATE profiles 
SET is_alumni = TRUE 
WHERE status = 'graduated';
