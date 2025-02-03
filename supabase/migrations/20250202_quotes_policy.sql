-- Remover políticas existentes da tabela quotes
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON quotes;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON quotes;
DROP POLICY IF EXISTS "Enable update for owner and landlord" ON quotes;

-- Criar novas políticas mais permissivas
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Permitir leitura para todos os usuários autenticados
CREATE POLICY "Permitir leitura para usuários autenticados"
ON quotes FOR SELECT
TO authenticated
USING (true);

-- Permitir inserção para todos os usuários autenticados
CREATE POLICY "Permitir inserção para usuários autenticados"
ON quotes FOR INSERT
TO authenticated
WITH CHECK (true);

-- Permitir atualização para todos os usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados"
ON quotes FOR UPDATE
TO authenticated
USING (true);

-- Criar função para obter o landlord_id
CREATE OR REPLACE FUNCTION get_default_landlord()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM profiles WHERE role = 'landlord' LIMIT 1;
$$;

-- Criar trigger para definir o landlord_id automaticamente
CREATE OR REPLACE FUNCTION set_default_landlord()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.landlord_id IS NULL THEN
    NEW.landlord_id := get_default_landlord();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar o trigger na tabela quotes
DROP TRIGGER IF EXISTS set_landlord_trigger ON quotes;
CREATE TRIGGER set_landlord_trigger
  BEFORE INSERT ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION set_default_landlord();
