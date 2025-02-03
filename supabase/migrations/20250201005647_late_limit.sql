-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quotes are viewable by everyone" ON quotes;
    DROP POLICY IF EXISTS "Quotes are viewable by involved parties" ON quotes;
    DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Landlords can update quotes" ON quotes;
    DROP POLICY IF EXISTS "Landlords can update their quotes" ON quotes;
END $$;

-- Create new, simpler policies for quotes
CREATE POLICY "Quotes are viewable by involved parties"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "Clients can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Landlords can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Drop existing policies for quote_accessories
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quote accessories are viewable by everyone" ON quote_accessories;
    DROP POLICY IF EXISTS "Quote accessories are viewable by involved parties" ON quote_accessories;
    DROP POLICY IF EXISTS "Clients can manage quote accessories" ON quote_accessories;
    DROP POLICY IF EXISTS "Clients can manage their quote accessories" ON quote_accessories;
END $$;

-- Create new policies for quote_accessories
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
        auth.uid() = quotes.landlord_id
      )
    )
  );

CREATE POLICY "Clients can manage quote accessories"
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