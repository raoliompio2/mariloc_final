/*
  # Create machine management tables

  1. New Tables
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `banner_url` (text)
      - `icon_url` (text)
      - `parent_id` (uuid, self-reference for subcategories)
      - `created_at` (timestamp)

    - `machines`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `main_image_url` (text)
      - `category_id` (uuid, foreign key)
      - `secondary_category_id` (uuid, foreign key)
      - `owner_id` (uuid, foreign key)
      - `created_at` (timestamp)

    - `machine_images`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, foreign key)
      - `image_url` (text)
      - `is_main` (boolean)
      - `created_at` (timestamp)

    - `technical_data`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, foreign key)
      - `label` (text)
      - `value` (text)
      - `is_highlight` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public read access to machines and categories
*/

-- Categories table
CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  banner_url text,
  icon_url text,
  parent_id uuid REFERENCES categories(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert categories"
  ON categories
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Owners can update their categories"
  ON categories
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Machines table
CREATE TABLE machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  main_image_url text,
  category_id uuid REFERENCES categories(id),
  secondary_category_id uuid REFERENCES categories(id),
  owner_id uuid REFERENCES auth.users(id) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE machines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Machines are viewable by everyone"
  ON machines
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can insert their own machines"
  ON machines
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own machines"
  ON machines
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own machines"
  ON machines
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- Machine images table
CREATE TABLE machine_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE NOT NULL,
  image_url text NOT NULL,
  is_main boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE machine_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Machine images are viewable by everyone"
  ON machine_images
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage images of their machines"
  ON machine_images
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE machines.id = machine_id
      AND machines.owner_id = auth.uid()
    )
  );

-- Technical data table
CREATE TABLE technical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE NOT NULL,
  label text NOT NULL,
  value text NOT NULL,
  is_highlight boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE technical_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Technical data is viewable by everyone"
  ON technical_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage technical data of their machines"
  ON technical_data
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM machines
      WHERE machines.id = machine_id
      AND machines.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_machines_owner ON machines(owner_id);
CREATE INDEX idx_machines_category ON machines(category_id);
CREATE INDEX idx_machines_secondary_category ON machines(secondary_category_id);
CREATE INDEX idx_machine_images_machine ON machine_images(machine_id);
CREATE INDEX idx_technical_data_machine ON technical_data(machine_id);
CREATE INDEX idx_technical_data_label ON technical_data(label);