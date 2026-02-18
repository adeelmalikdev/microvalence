-- Allow all authenticated users to browse profiles (professional platform)
CREATE POLICY "Authenticated users can browse profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);