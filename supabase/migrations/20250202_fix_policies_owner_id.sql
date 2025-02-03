-- Função auxiliar para criar política apenas se não existir
CREATE OR REPLACE FUNCTION create_policy_if_not_exists(
    policy_name text,
    table_name text,
    command text
) RETURNS void AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = table_name 
        AND policyname = policy_name
    ) THEN
        EXECUTE command;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se o usuário é proprietário
CREATE OR REPLACE FUNCTION is_proprietario() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users u 
    WHERE u.id = auth.uid() 
    AND u.raw_user_meta_data->>'role' = 'proprietario'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover políticas antigas
DROP POLICY IF EXISTS "Anyone can read technical data" ON technical_data;
DROP POLICY IF EXISTS "Allow admins to insert technical data" ON technical_data;
DROP POLICY IF EXISTS "Allow admins to update technical data" ON technical_data;
DROP POLICY IF EXISTS "Allow admins to delete technical data" ON technical_data;
DROP POLICY IF EXISTS "Allow owners to insert technical data" ON technical_data;
DROP POLICY IF EXISTS "Allow owners to update technical data" ON technical_data;
DROP POLICY IF EXISTS "Allow owners to delete technical data" ON technical_data;
DROP POLICY IF EXISTS "Technical data is viewable by everyone" ON technical_data;
DROP POLICY IF EXISTS "Users can manage technical data of their machines" ON technical_data;
DROP POLICY IF EXISTS "Users can insert technical data" ON technical_data;
DROP POLICY IF EXISTS "Users can update technical data" ON technical_data;
DROP POLICY IF EXISTS "Users can delete technical data" ON technical_data;
DROP POLICY IF EXISTS "Authenticated users can manage technical data" ON technical_data;

-- Criar novas políticas para technical_data
SELECT create_policy_if_not_exists(
    'Technical data is viewable by everyone',
    'technical_data',
    'CREATE POLICY "Technical data is viewable by everyone" ON technical_data FOR SELECT USING (true)'
);

-- Política única para gerenciar dados técnicos (apenas proprietário)
SELECT create_policy_if_not_exists(
    'Only proprietario can manage technical data',
    'technical_data',
    'CREATE POLICY "Only proprietario can manage technical data" ON technical_data FOR ALL USING (is_proprietario()) WITH CHECK (is_proprietario())'
);

-- Remover políticas antigas de machines
DROP POLICY IF EXISTS "Public read access to machines" ON machines;
DROP POLICY IF EXISTS "Admin manage machines" ON machines;
DROP POLICY IF EXISTS "Owner manage machines" ON machines;

-- Remover políticas antigas de machine_images
DROP POLICY IF EXISTS "Allow admins to delete machine images" ON machine_images;
DROP POLICY IF EXISTS "Allow admins to insert machine images" ON machine_images;
DROP POLICY IF EXISTS "Allow owners to insert machine images" ON machine_images;
DROP POLICY IF EXISTS "Allow owners to delete machine images" ON machine_images;

-- Remover políticas antigas de storage
DROP POLICY IF EXISTS "Allow admins to delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow admins to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to upload" ON storage.objects;

-- Criar novas políticas para storage
SELECT create_policy_if_not_exists(
    'Allow proprietario to delete',
    'storage.objects',
    'CREATE POLICY "Allow proprietario to delete" ON storage.objects FOR DELETE USING (is_proprietario())'
);

SELECT create_policy_if_not_exists(
    'Allow proprietario to upload',
    'storage.objects',
    'CREATE POLICY "Allow proprietario to upload" ON storage.objects FOR INSERT WITH CHECK (is_proprietario())'
);

-- Limpar funções auxiliares
DROP FUNCTION IF EXISTS create_policy_if_not_exists;
