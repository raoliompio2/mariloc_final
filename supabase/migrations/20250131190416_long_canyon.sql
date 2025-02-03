/*
  # Update Categories RLS Policies

  1. Changes
    - Updates RLS policies for the categories table
    - Allows authenticated users to manage categories
  
  2. Security
    - Public read access
    - Write access for authenticated users
    - No restrictions on category management for authenticated users
*/

-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
    DROP POLICY IF EXISTS "Authenticated users can insert categories" ON categories;
    DROP POLICY IF EXISTS "Owners can update their categories" ON categories;
END $$;

-- Create new policies
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