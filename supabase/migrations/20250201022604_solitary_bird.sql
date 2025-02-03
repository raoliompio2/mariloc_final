-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Anyone can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Landlords can manage their rentals" ON rentals;
END $$;

-- Add price column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rentals' AND column_name = 'price'
  ) THEN
    ALTER TABLE rentals ADD COLUMN price numeric(10,2);
  END IF;
END $$;

-- Create new policies for rentals with proper permissions
CREATE POLICY "Rentals are viewable by involved parties"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "Clients can create rentals"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM machines
      WHERE machines.id = machine_id
      AND machines.owner_id = landlord_id
    )
  );

CREATE POLICY "Landlords can update their rentals"
  ON rentals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Landlords can delete their rentals"
  ON rentals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = landlord_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rentals_client ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_machine ON rentals(machine_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_created_at ON rentals(created_at);