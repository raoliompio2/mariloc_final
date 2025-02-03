-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals from quotes" ON rentals;
    DROP POLICY IF EXISTS "Landlords can manage their rentals" ON rentals;
END $$;

-- Create new policies with proper error handling
CREATE POLICY "Anyone can view rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create rentals from quotes"
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

CREATE POLICY "Landlords can manage their rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = landlord_id OR
    auth.uid() IN (
      SELECT owner_id FROM machines WHERE id = machine_id
    )
  )
  WITH CHECK (
    auth.uid() = landlord_id OR
    auth.uid() IN (
      SELECT owner_id FROM machines WHERE id = machine_id
    )
  );