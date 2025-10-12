-- Create quest-photos storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quest-photos',
  'quest-photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for quest-photos bucket
CREATE POLICY "Users can upload their own quest photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'quest-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view all quest photos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'quest-photos');

CREATE POLICY "Users can delete their own quest photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'quest-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
