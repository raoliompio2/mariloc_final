-- Drop existing policies if they exist
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Landlords can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Involved parties can update rentals" ON rentals;
END $$;

-- Create new policies for rentals
CREATE POLICY "Rentals are viewable by involved parties"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

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

CREATE POLICY "Landlords can update their rentals"
  ON rentals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rentals_client ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_machine ON rentals(machine_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);