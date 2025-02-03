-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Landlords can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Involved parties can update rentals" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals from approved quotes" ON rentals;
    DROP POLICY IF EXISTS "Landlords can update their rentals" ON rentals;
END $$;

-- Modify rentals table to update status constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'rentals_status_check'
  ) THEN
    ALTER TABLE rentals DROP CONSTRAINT rentals_status_check;
  END IF;
END $$;

ALTER TABLE rentals ADD CONSTRAINT rentals_status_check 
  CHECK (status IN ('pending', 'active', 'completed', 'cancelled'));

-- Create new policies for rentals
DO $$
BEGIN
  -- Only create policies if they don't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Rentals are viewable by involved parties'
    AND tablename = 'rentals'
  ) THEN
    CREATE POLICY "Rentals are viewable by involved parties"
      ON rentals
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = client_id OR 
        auth.uid() = landlord_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Clients can create rentals from approved quotes'
    AND tablename = 'rentals'
  ) THEN
    CREATE POLICY "Clients can create rentals from approved quotes"
      ON rentals
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = client_id AND
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.machine_id = machine_id
          AND quotes.client_id = client_id
          AND quotes.landlord_id = landlord_id
          AND quotes.status = 'answered'
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE policyname = 'Landlords can update their rentals'
    AND tablename = 'rentals'
  ) THEN
    CREATE POLICY "Landlords can update their rentals"
      ON rentals
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = landlord_id)
      WITH CHECK (auth.uid() = landlord_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rentals_client ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_machine ON rentals(machine_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);