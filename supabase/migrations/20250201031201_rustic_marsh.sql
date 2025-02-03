-- Primeiro remover todas as políticas existentes
DO $$
BEGIN
    -- Remover políticas de returns
    DROP POLICY IF EXISTS "Returns are viewable by involved parties" ON returns;
    DROP POLICY IF EXISTS "Landlords can update returns" ON returns;
    DROP POLICY IF EXISTS "Anyone can view returns" ON returns;
    DROP POLICY IF EXISTS "Admin can manage returns" ON returns;
    
    -- Remover políticas de rental_accessories
    DROP POLICY IF EXISTS "Rental accessories are viewable by involved parties" ON rental_accessories;
    DROP POLICY IF EXISTS "Landlords can manage rental accessories" ON rental_accessories;
    DROP POLICY IF EXISTS "Anyone can view rental accessories" ON rental_accessories;
    DROP POLICY IF EXISTS "Admin can manage rental accessories" ON rental_accessories;
    
    -- Remover políticas de rentals
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals from quotes" ON rentals;
    DROP POLICY IF EXISTS "Landlords can manage their rentals" ON rentals;
    DROP POLICY IF EXISTS "Anyone can view rentals" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Admin can manage rentals" ON rentals;
    
    -- Remover políticas de quotes
    DROP POLICY IF EXISTS "Quotes are viewable by involved parties" ON quotes;
    DROP POLICY IF EXISTS "Clients can create quotes" ON quotes;
    DROP POLICY IF EXISTS "Landlords can update their quotes" ON quotes;
    DROP POLICY IF EXISTS "Anyone can view quotes" ON quotes;
    DROP POLICY IF EXISTS "Admin can manage quotes" ON quotes;
    
    -- Remover políticas de machines
    DROP POLICY IF EXISTS "Anyone can view machines" ON machines;
    DROP POLICY IF EXISTS "Admin can manage machines" ON machines;
END $$;

-- Criar políticas super simples que permitem acesso total ao admin
CREATE POLICY "Admin full access to rentals"
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

CREATE POLICY "Admin full access to quotes"
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

CREATE POLICY "Admin full access to machines"
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

CREATE POLICY "Admin full access to returns"
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

CREATE POLICY "Admin full access to rental_accessories"
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

-- Permitir que clientes vejam tudo
CREATE POLICY "Clients can view rentals"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can view quotes"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can view machines"
  ON machines
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can view returns"
  ON returns
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Clients can view rental_accessories"
  ON rental_accessories
  FOR SELECT
  TO authenticated
  USING (true);