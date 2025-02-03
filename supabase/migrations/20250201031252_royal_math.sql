-- Remover todas as políticas existentes
DO $$
BEGIN
    DROP POLICY IF EXISTS "Admin full access to rentals" ON rentals;
    DROP POLICY IF EXISTS "Admin full access to quotes" ON quotes;
    DROP POLICY IF EXISTS "Admin full access to machines" ON machines;
    DROP POLICY IF EXISTS "Admin full access to returns" ON returns;
    DROP POLICY IF EXISTS "Admin full access to rental_accessories" ON rental_accessories;
    DROP POLICY IF EXISTS "Clients can view rentals" ON rentals;
    DROP POLICY IF EXISTS "Clients can view quotes" ON quotes;
    DROP POLICY IF EXISTS "Clients can view machines" ON machines;
    DROP POLICY IF EXISTS "Clients can view returns" ON returns;
    DROP POLICY IF EXISTS "Clients can view rental_accessories" ON rental_accessories;
END $$;

-- Criar políticas que permitem acesso total a qualquer usuário autenticado
CREATE POLICY "Full access to rentals"
  ON rentals
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full access to quotes"
  ON quotes
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full access to machines"
  ON machines
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full access to returns"
  ON returns
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Full access to rental_accessories"
  ON rental_accessories
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);