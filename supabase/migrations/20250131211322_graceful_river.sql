/*
  # Add storage bucket and policies for accessory images

  1. Storage
    - Create 'accessory-images' bucket
    - Set bucket as public
  
  2. Policies
    - Allow public viewing of accessory images
    - Allow authenticated users to upload images
    - Allow users to manage their own images
*/

BEGIN;

-- Create bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('accessory-images', 'accessory-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Public can view accessory images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload accessory images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can update their accessory images" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can delete their accessory images" ON storage.objects;
END $$;

-- Create storage policies
CREATE POLICY "Public can view accessory images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'accessory-images');

CREATE POLICY "Authenticated users can upload accessory images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'accessory-images');

CREATE POLICY "Authenticated users can update their accessory images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'accessory-images');

CREATE POLICY "Authenticated users can delete their accessory images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'accessory-images');

COMMIT;