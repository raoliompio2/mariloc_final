-- Remover políticas existentes
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals from quotes" ON rentals;
    DROP POLICY IF EXISTS "Landlords can manage their rentals" ON rentals;
    DROP POLICY IF EXISTS "Anyone can view rentals" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Landlords can update rentals" ON rentals;
END $$;

-- Remover coluna landlord_id de todas as tabelas
ALTER TABLE rentals DROP COLUMN IF EXISTS landlord_id;
ALTER TABLE quotes DROP COLUMN IF EXISTS landlord_id;

-- Remover coluna owner_id de machines
ALTER TABLE machines DROP COLUMN IF EXISTS owner_id;

-- Simplificar políticas para rentals
CREATE POLICY "Anyone can view rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create rentals"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admin can manage rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'landlord'
    )
  );

-- Simplificar políticas para quotes
CREATE POLICY "Anyone can view quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Admin can manage quotes"
  ON quotes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'landlord'
    )
  );

-- Simplificar políticas para machines
CREATE POLICY "Anyone can view machines"
  ON machines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage machines"
  ON machines
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'landlord'
    )
  );