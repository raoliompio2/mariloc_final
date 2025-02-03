-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quote access for clients and admin" ON quotes;
    DROP POLICY IF EXISTS "Quote creation for clients" ON quotes;
    DROP POLICY IF EXISTS "Quote updates for admin" ON quotes;
END $$;

-- Create simpler policies for quotes
CREATE POLICY "Public read access to quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public create access to quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin update access to quotes"
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

-- Create function to get default landlord
CREATE OR REPLACE FUNCTION get_default_landlord()
RETURNS uuid AS $$
DECLARE
  landlord_id uuid;
BEGIN
  -- Try to get existing landlord
  SELECT id INTO landlord_id
  FROM profiles
  WHERE role = 'landlord'
  LIMIT 1;
  
  -- If no landlord exists, create one
  IF landlord_id IS NULL THEN
    INSERT INTO profiles (email, role, name)
    VALUES ('admin@example.com', 'landlord', 'Administrador')
    RETURNING id INTO landlord_id;
  END IF;
  
  RETURN landlord_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set landlord_id
CREATE OR REPLACE FUNCTION set_quote_landlord()
RETURNS TRIGGER AS $$
BEGIN
  NEW.landlord_id := get_default_landlord();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quote_landlord_trigger ON quotes;
CREATE TRIGGER set_quote_landlord_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_landlord();