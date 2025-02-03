-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin and owner can view quotes" ON quotes;
    DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Only admin can update quotes" ON quotes;
END $$;

-- Create simpler policies for quotes
CREATE POLICY "Anyone can view quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

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