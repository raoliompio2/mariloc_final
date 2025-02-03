-- Remover todas as políticas existentes
DO $$
BEGIN
    DROP POLICY IF EXISTS "Full access to rentals" ON rentals;
    DROP POLICY IF EXISTS "Full access to quotes" ON quotes;
    DROP POLICY IF EXISTS "Full access to machines" ON machines;
    DROP POLICY IF EXISTS "Full access to returns" ON returns;
    DROP POLICY IF EXISTS "Full access to rental_accessories" ON rental_accessories;
END $$;

-- Criar função para verificar se é admin
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

-- Criar função para verificar se é o cliente dono do registro
CREATE OR REPLACE FUNCTION is_owner(client_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() = client_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas para machines
CREATE POLICY "Anyone can view machines"
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

-- Políticas para quotes
CREATE POLICY "Admin and owner can view quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (is_admin() OR is_owner(client_id));

CREATE POLICY "Clients can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (is_owner(client_id));

CREATE POLICY "Only admin can update quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para rentals
CREATE POLICY "Admin and owner can view rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (is_admin() OR is_owner(client_id));

CREATE POLICY "Only admin can manage rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para returns
CREATE POLICY "Admin and owner can view returns"
  ON returns
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR 
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_id
      AND is_owner(rentals.client_id)
    )
  );

CREATE POLICY "Only admin can manage returns"
  ON returns
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Políticas para rental_accessories
CREATE POLICY "Admin and owner can view rental accessories"
  ON rental_accessories
  FOR SELECT
  TO authenticated
  USING (
    is_admin() OR
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_id
      AND is_owner(rentals.client_id)
    )
  );

CREATE POLICY "Only admin can manage rental accessories"
  ON rental_accessories
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger para automaticamente setar landlord_id nas quotes
CREATE OR REPLACE FUNCTION set_admin_as_landlord()
RETURNS TRIGGER AS $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id
  FROM profiles
  WHERE role = 'landlord'
  LIMIT 1;

  NEW.landlord_id := admin_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_quote_landlord_id
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_as_landlord();

CREATE TRIGGER set_rental_landlord_id
  BEFORE INSERT ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_as_landlord();

-- Trigger para automaticamente setar owner_id nas machines
CREATE TRIGGER set_machine_owner_id
  BEFORE INSERT ON machines
  FOR EACH ROW
  EXECUTE FUNCTION set_admin_as_landlord();