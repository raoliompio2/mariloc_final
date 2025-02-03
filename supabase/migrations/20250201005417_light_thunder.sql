-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quotes are viewable by involved parties" ON quotes;
    DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Landlords can update their quotes" ON quotes;
    DROP POLICY IF EXISTS "Quote accessories are viewable by involved parties" ON quote_accessories;
    DROP POLICY IF EXISTS "Clients can manage their quote accessories" ON quote_accessories;
END $$;

-- Create more specific policies for quotes
CREATE POLICY "Quotes are viewable by involved parties"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id OR
    auth.uid() IN (
      SELECT owner_id FROM machines WHERE id = machine_id
    )
  );

CREATE POLICY "Clients can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM machines WHERE id = machine_id
    )
  );

CREATE POLICY "Landlords can update their quotes"
  ON quotes
  FOR UPDATE
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

-- Create more specific policies for quote accessories
CREATE POLICY "Quote accessories are viewable by involved parties"
  ON quote_accessories
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_id
      AND (
        auth.uid() = quotes.client_id OR
        auth.uid() = quotes.landlord_id OR
        auth.uid() IN (
          SELECT owner_id FROM machines WHERE id = quotes.machine_id
        )
      )
    )
  );

CREATE POLICY "Clients can manage their quote accessories"
  ON quote_accessories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_id
      AND auth.uid() = quotes.client_id
      AND quotes.status = 'pending'
    )
  );

-- Add function to automatically set landlord_id
CREATE OR REPLACE FUNCTION set_quote_landlord_id()
RETURNS TRIGGER AS $$
BEGIN
  NEW.landlord_id := (
    SELECT owner_id 
    FROM machines 
    WHERE id = NEW.machine_id
  );
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to set landlord_id before insert
DROP TRIGGER IF EXISTS set_quote_landlord_id_trigger ON quotes;
CREATE TRIGGER set_quote_landlord_id_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_landlord_id();