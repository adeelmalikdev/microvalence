
-- Create storage bucket for opportunity task attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('opportunity-task-attachments', 'opportunity-task-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their folder
CREATE POLICY "Recruiters can upload task attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'opportunity-task-attachments' AND auth.role() = 'authenticated');

-- Public read access
CREATE POLICY "Task attachments are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'opportunity-task-attachments');

-- Uploaders can delete their files
CREATE POLICY "Users can delete own task attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'opportunity-task-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add attachment_url column to tasks table
ALTER TABLE public.tasks ADD COLUMN attachment_url text;
