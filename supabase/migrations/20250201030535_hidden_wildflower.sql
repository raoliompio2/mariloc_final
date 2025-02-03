-- Primeiro remover as políticas que dependem das colunas
DO $$
BEGIN
    -- Remover políticas de returns
    DROP POLICY IF EXISTS "Returns are viewable by involved parties" ON returns;
    DROP POLICY IF EXISTS "Landlords can update returns" ON returns;
    
    -- Remover políticas de rental_accessories
    DROP POLICY IF EXISTS "Rental accessories are viewable by involved parties" ON rental_accessories;
    DROP POLICY IF EXISTS "Landlords can manage rental accessories" ON rental_accessories;
    
    -- Remover políticas de rentals
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals from quotes" ON rentals;
    DROP POLICY IF EXISTS "Landlords can manage their rentals" ON rentals;
    DROP POLICY IF EXISTS "Anyone can view rentals" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Landlords can update rentals" ON rentals;
    
    -- Remover políticas de quotes
    DROP POLICY IF EXISTS "Quotes are viewable by involved parties" ON quotes;
    DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Landlords can update their quotes" ON quotes;
END $$;

-- Remover colunas com CASCADE para lidar com dependências
ALTER TABLE rentals DROP COLUMN IF EXISTS landlord_id CASCADE;
ALTER TABLE quotes DROP COLUMN IF EXISTS landlord_id CASCADE;
ALTER TABLE machines DROP COLUMN IF EXISTS owner_id CASCADE;

-- Criar novas políticas simplificadas para rentals
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

-- Criar novas políticas simplificadas para quotes
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

-- Criar novas políticas simplificadas para machines
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

-- Criar novas políticas simplificadas para returns
CREATE POLICY "Anyone can view returns"
  ON returns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage returns"
  ON returns
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'landlord'
    )
  );

-- Criar novas políticas simplificadas para rental_accessories
CREATE POLICY "Anyone can view rental accessories"
  ON rental_accessories
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage rental accessories"
  ON rental_accessories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'landlord'
    )
  );