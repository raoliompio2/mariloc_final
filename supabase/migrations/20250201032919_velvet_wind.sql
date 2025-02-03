-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view quotes" ON quotes;
    DROP POLICY IF EXISTS "Anyone can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Anyone can update quotes" ON quotes;
END $$;

-- Create proper policies for quotes
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

CREATE POLICY "Landlords can update their quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Add response_price column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'response_price'
  ) THEN
    ALTER TABLE quotes ADD COLUMN response_price numeric(10,2);
  END IF;
END $$;