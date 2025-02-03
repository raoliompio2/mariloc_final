-- Drop existing policies first
DO $$
BEGIN
    DROP POLICY IF EXISTS "Anyone can view quotes" ON quotes;
    DROP POLICY IF EXISTS "Anyone can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Admin can update quotes" ON quotes;
    DROP POLICY IF EXISTS "Anyone can view machines" ON machines;
    DROP POLICY IF EXISTS "Only admin can manage machines" ON machines;
END $$;

-- Create function to get or create admin
CREATE OR REPLACE FUNCTION get_or_create_admin()
RETURNS uuid AS $$
DECLARE
  admin_id uuid;
BEGIN
  -- Try to get existing admin
  SELECT id INTO admin_id
  FROM profiles
  WHERE role = 'landlord'
  LIMIT 1;
  
  -- If no admin exists, create one
  IF admin_id IS NULL THEN
    INSERT INTO profiles (email, role, name)
    VALUES ('admin@example.com', 'landlord', 'Administrador')
    RETURNING id INTO admin_id;
  END IF;
  
  RETURN admin_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'landlord'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simpler policies for quotes
CREATE POLICY "Quotes are viewable by client or admin"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    is_admin()
  );

CREATE POLICY "Clients can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Only admin can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger to set landlord_id on quotes
CREATE OR REPLACE FUNCTION set_quote_landlord()
RETURNS TRIGGER AS $$
BEGIN
  NEW.landlord_id := get_or_create_admin();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_quote_landlord_trigger ON quotes;
CREATE TRIGGER set_quote_landlord_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_quote_landlord();

-- Create policies for machines
CREATE POLICY "Public can view machines"
  ON machines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admin can manage machines"
  ON machines
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger to set owner_id on machines
CREATE OR REPLACE FUNCTION set_machine_owner()
RETURNS TRIGGER AS $$
BEGIN
  NEW.owner_id := get_or_create_admin();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_machine_owner_trigger ON machines;
CREATE TRIGGER set_machine_owner_trigger
  BEFORE INSERT ON machines
  FOR EACH ROW
  EXECUTE FUNCTION set_machine_owner();

-- Create policies for rentals
CREATE POLICY "Rentals are viewable by client or admin"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR
    is_admin()
  );

CREATE POLICY "Clients can create rentals"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Only admin can update rentals"
  ON rentals
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger to set landlord_id on rentals
CREATE OR REPLACE FUNCTION set_rental_landlord()
RETURNS TRIGGER AS $$
BEGIN
  NEW.landlord_id := get_or_create_admin();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_rental_landlord_trigger ON rentals;
CREATE TRIGGER set_rental_landlord_trigger
  BEFORE INSERT ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION set_rental_landlord();