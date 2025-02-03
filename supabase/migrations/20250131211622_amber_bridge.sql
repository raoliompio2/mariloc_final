/*
  # Create accessories tables and policies

  1. Tables
    - Create accessories table with price and stock tracking
    - Create accessory_images table for gallery management
  
  2. Security
    - Enable RLS on both tables
    - Create policies for public viewing and authenticated user management
  
  3. Indexes
    - Create indexes for better query performance
*/

-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Accessories are viewable by everyone" ON accessories;
    DROP POLICY IF EXISTS "Users can insert their own accessories" ON accessories;
    DROP POLICY IF EXISTS "Users can update their own accessories" ON accessories;
    DROP POLICY IF EXISTS "Users can delete their own accessories" ON accessories;
    DROP POLICY IF EXISTS "Accessory images are viewable by everyone" ON accessory_images;
    DROP POLICY IF EXISTS "Users can manage images of their accessories" ON accessory_images;
END $$;

-- Create accessories table if it doesn't exist
CREATE TABLE IF NOT EXISTS accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  main_image_url text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  stock integer NOT NULL DEFAULT 0,
  machine_id uuid REFERENCES machines(id),
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create accessory images table if it doesn't exist
CREATE TABLE IF NOT EXISTS accessory_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessory_id uuid REFERENCES accessories(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  is_main boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accessory_images ENABLE ROW LEVEL SECURITY;

-- Create policies for accessories
CREATE POLICY "Accessories are viewable by everyone"
  ON accessories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own accessories"
  ON accessories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own accessories"
  ON accessories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own accessories"
  ON accessories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Create policies for accessory images
CREATE POLICY "Accessory images are viewable by everyone"
  ON accessory_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage images of their accessories"
  ON accessory_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accessories
      WHERE accessories.id = accessory_id
      AND accessories.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_accessories_owner ON accessories(owner_id);
CREATE INDEX IF NOT EXISTS idx_accessories_machine ON accessories(machine_id);
CREATE INDEX IF NOT EXISTS idx_accessory_images_accessory ON accessory_images(accessory_id);