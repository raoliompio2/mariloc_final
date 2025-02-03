/*
  # Fix Categories Storage and RLS

  1. Changes
    - Creates category-images storage bucket
    - Sets up proper storage policies
    - Updates categories table RLS policies
  
  2. Security
    - Public read access for images and categories
    - Write access for authenticated users
    - No restrictions on category management for authenticated users
*/

BEGIN;

-- Create the storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('category-images', 'category-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Category images are publicly accessible" ON storage.objects;
    DROP POLICY IF EXISTS "Users can upload category images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update their own category images" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete their own category images" ON storage.objects;
END $$;

-- Create storage policies
CREATE POLICY "Category images are publicly accessible"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'category-images');

CREATE POLICY "Users can upload category images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'category-images');

CREATE POLICY "Users can update category images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'category-images');

CREATE POLICY "Users can delete category images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'category-images');

-- Drop existing category policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
    DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
    DROP POLICY IF EXISTS "Owners can update their categories" ON categories;
    DROP POLICY IF EXISTS "Authenticated users can manage categories" ON categories;
END $$;

-- Create new category policies
CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage categories"
  ON categories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

COMMIT;