/*
  # Add slug field to categories

  1. Changes
    - Add slug field to categories table
    - Create function to generate slug from name
    - Create trigger to automatically generate slug
    - Update existing categories with slugs
*/

-- Add slug column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'slug'
  ) THEN
    ALTER TABLE categories ADD COLUMN slug text;
    ALTER TABLE categories ADD CONSTRAINT categories_slug_unique UNIQUE (slug);
  END IF;
END $$;

-- Create function to generate slug
CREATE OR REPLACE FUNCTION generate_slug(name text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          name,
          '[^a-zA-Z0-9\s-]',
          '',
          'g'
        ),
        '\s+',
        '-',
        'g'
      ),
      '-+',
      '-',
      'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Create trigger function
CREATE OR REPLACE FUNCTION categories_generate_slug()
RETURNS trigger AS $$
DECLARE
  new_slug text;
  counter integer := 0;
BEGIN
  -- Generate initial slug
  new_slug := generate_slug(NEW.name);
  
  -- Check for duplicates and append number if needed
  WHILE EXISTS (
    SELECT 1 FROM categories 
    WHERE slug = new_slug 
    AND id != NEW.id
  ) LOOP
    counter := counter + 1;
    new_slug := generate_slug(NEW.name) || '-' || counter;
  END LOOP;
  
  NEW.slug := new_slug;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace trigger
DROP TRIGGER IF EXISTS categories_before_insert_update ON categories;
CREATE TRIGGER categories_before_insert_update
  BEFORE INSERT OR UPDATE OF name
  ON categories
  FOR EACH ROW
  EXECUTE FUNCTION categories_generate_slug();

-- Update existing categories with slugs
UPDATE categories SET name = name WHERE slug IS NULL;