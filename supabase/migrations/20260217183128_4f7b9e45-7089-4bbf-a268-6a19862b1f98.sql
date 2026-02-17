
-- Create storage bucket for alumni post media
INSERT INTO storage.buckets (id, name, public)
VALUES ('alumni-media', 'alumni-media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload alumni media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'alumni-media');

-- Allow public read access
CREATE POLICY "Alumni media is publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'alumni-media');

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own alumni media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'alumni-media' AND auth.uid()::text = (storage.foldername(name))[1]);
