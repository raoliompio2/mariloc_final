/*
  # Fix storage policies for machine images

  1. Changes
    - Drop existing policies
    - Create new policies with proper RLS
    - Allow authenticated users to manage their own images
    - Allow public access to view images

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add policy for public access
*/

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Machine images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload machine images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;
END $$;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('machine-images', 'machine-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create new policies
CREATE POLICY "Public can view machine images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'machine-images');

CREATE POLICY "Authenticated users can upload machine images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'machine-images'
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update their machine images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'machine-images'
  AND owner = auth.uid()
);

CREATE POLICY "Authenticated users can delete their machine images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'machine-images'
  AND owner = auth.uid()
);