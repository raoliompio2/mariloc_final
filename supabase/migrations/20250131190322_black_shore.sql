/*
  # Add category-images bucket

  1. Changes
    - Creates a new storage bucket for category images
    - Sets up public access policies
    - Configures upload permissions for authenticated users
  
  2. Security
    - Public read access for all images
    - Write access restricted to authenticated users
*/

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
CREATE POLICY "Category images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-images');

-- Allow authenticated users to upload images
CREATE POLICY "Users can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'category-images'
  AND (storage.foldername(name))[1] != 'private'
);

-- Allow users to update and delete their own uploads
CREATE POLICY "Users can update their own category images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'category-images' AND owner = auth.uid());

CREATE POLICY "Users can delete their own category images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'category-images' AND owner = auth.uid());