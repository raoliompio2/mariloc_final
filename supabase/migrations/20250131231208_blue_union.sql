/*
  # Fix machine-profile relationship

  1. Changes
    - Drop existing foreign key if it exists
    - Add foreign key relationship between machines and profiles tables
    - Add index for better performance
*/

-- Drop existing foreign key if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'machines_owner_id_fkey'
    AND table_name = 'machines'
  ) THEN
    ALTER TABLE machines DROP CONSTRAINT machines_owner_id_fkey;
  END IF;
END $$;

-- Add foreign key constraint for owner_id in machines table
ALTER TABLE machines
ADD CONSTRAINT machines_owner_id_fkey
FOREIGN KEY (owner_id)
REFERENCES profiles(id)
ON DELETE CASCADE;

-- Add index for owner_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_machines_owner_id ON machines(owner_id);