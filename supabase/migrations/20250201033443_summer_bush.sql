-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quotes are viewable by involved parties" ON quotes;
    DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Landlords can update their quotes" ON quotes;
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

CREATE POLICY "Admin can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'landlord'
    )
  );

-- Create function to automatically set landlord_id
CREATE OR REPLACE FUNCTION get_admin_id()
RETURNS uuid AS $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id
  FROM profiles
  WHERE role = 'landlord'
  LIMIT 1;
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set landlord_id on quotes
CREATE OR REPLACE FUNCTION set_quote_landlord()
RETURNS TRIGGER AS $$
BEGIN
  NEW.landlord_id := get_admin_id();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quote_landlord_trigger ON quotes;
CREATE TRIGGER set_quote_landlord_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_landlord();