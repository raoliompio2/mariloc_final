-- Safely handle the foreign key constraint
DO $$
BEGIN
  -- Drop existing foreign key if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'machines_owner_id_fkey'
    AND table_name = 'machines'
  ) THEN
    ALTER TABLE machines DROP CONSTRAINT machines_owner_id_fkey;
  END IF;

  -- Add foreign key constraint for owner_id in machines table
  ALTER TABLE machines
  ADD CONSTRAINT machines_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;
END $$;

-- Add index for owner_id if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_machines_owner_id ON machines(owner_id);