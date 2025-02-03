-- Função auxiliar para verificar se é landlord
CREATE OR REPLACE FUNCTION is_landlord() 
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM auth.users u 
    WHERE u.id = auth.uid() 
    AND u.raw_user_meta_data->>'role' = 'landlord'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Remover todas as políticas antigas
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

-- Políticas para technical_data
SELECT create_policy_if_not_exists(
    'Technical data is viewable by everyone',
    'technical_data',
    'CREATE POLICY "Technical data is viewable by everyone" ON technical_data FOR SELECT USING (true)'
);

SELECT create_policy_if_not_exists(
    'Landlord can manage technical data',
    'technical_data',
    'CREATE POLICY "Landlord can manage technical data" ON technical_data FOR ALL USING (is_landlord()) WITH CHECK (is_landlord())'
);

-- Políticas para machines
SELECT create_policy_if_not_exists(
    'Machines are viewable by everyone',
    'machines',
    'CREATE POLICY "Machines are viewable by everyone" ON machines FOR SELECT USING (true)'
);

SELECT create_policy_if_not_exists(
    'Landlord can manage machines',
    'machines',
    'CREATE POLICY "Landlord can manage machines" ON machines FOR ALL USING (is_landlord()) WITH CHECK (is_landlord())'
);

-- Políticas para machine_images
SELECT create_policy_if_not_exists(
    'Machine images are viewable by everyone',
    'machine_images',
    'CREATE POLICY "Machine images are viewable by everyone" ON machine_images FOR SELECT USING (true)'
);

SELECT create_policy_if_not_exists(
    'Landlord can manage machine images',
    'machine_images',
    'CREATE POLICY "Landlord can manage machine images" ON machine_images FOR ALL USING (is_landlord()) WITH CHECK (is_landlord())'
);

-- Políticas para categories
SELECT create_policy_if_not_exists(
    'Categories are viewable by everyone',
    'categories',
    'CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true)'
);

SELECT create_policy_if_not_exists(
    'Landlord can manage categories',
    'categories',
    'CREATE POLICY "Landlord can manage categories" ON categories FOR ALL USING (is_landlord()) WITH CHECK (is_landlord())'
);

-- Políticas para storage
SELECT create_policy_if_not_exists(
    'Storage objects are viewable by everyone',
    'storage.objects',
    'CREATE POLICY "Storage objects are viewable by everyone" ON storage.objects FOR SELECT USING (bucket_id = ''machine-images'')'
);

SELECT create_policy_if_not_exists(
    'Landlord can manage storage',
    'storage.objects',
    'CREATE POLICY "Landlord can manage storage" ON storage.objects FOR ALL USING (is_landlord() AND bucket_id = ''machine-images'') WITH CHECK (is_landlord() AND bucket_id = ''machine-images'')'
);

-- Limpar funções auxiliares
DROP FUNCTION IF EXISTS create_policy_if_not_exists;
