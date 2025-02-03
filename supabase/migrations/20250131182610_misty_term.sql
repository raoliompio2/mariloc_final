/*
  # Add storage bucket for machine images
  
  1. New Storage
    - Create a new public bucket for machine images
    
  2. Security
    - Enable public access for viewing images
    - Add policy for authenticated users to upload images
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('machine-images', 'machine-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
CREATE POLICY "Machine images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'machine-images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload machine images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'machine-images'
  AND (storage.foldername(name))[1] != 'private'
);

-- Allow users to update and delete their own uploads
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'machine-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'machine-images' AND owner = auth.uid());