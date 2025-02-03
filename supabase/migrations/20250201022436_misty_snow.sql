-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals from approved quotes" ON rentals;
    DROP POLICY IF EXISTS "Landlords can manage their rentals" ON rentals;
END $$;

-- Create new policies for rentals with better permissions
CREATE POLICY "Rentals are viewable by involved parties"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "Anyone can create rentals"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Landlords can manage their rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Add response_price to rentals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rentals' AND column_name = 'price'
  ) THEN
    ALTER TABLE rentals ADD COLUMN price numeric(10,2);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rentals_client ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_machine ON rentals(machine_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);