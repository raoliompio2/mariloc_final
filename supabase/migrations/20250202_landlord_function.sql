-- Função para obter o ID do landlord padrão
CREATE OR REPLACE FUNCTION get_default_landlord()
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT id FROM profiles WHERE role = 'landlord' LIMIT 1;
$$;
