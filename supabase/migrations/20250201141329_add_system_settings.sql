-- Remover a tabela se existir
DROP TABLE IF EXISTS system_settings;

-- Recriar a tabela
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  light_header_logo_url TEXT,
  dark_header_logo_url TEXT,
  light_footer_logo_url TEXT,
  dark_footer_logo_url TEXT,
  light_header_color TEXT NOT NULL DEFAULT '#ffffff',
  light_header_text_color TEXT NOT NULL DEFAULT '#1e293b',
  light_footer_color TEXT NOT NULL DEFAULT '#f8fafc',
  light_footer_text_color TEXT NOT NULL DEFAULT '#1e293b',
  dark_header_color TEXT NOT NULL DEFAULT '#001a41',
  dark_header_text_color TEXT NOT NULL DEFAULT '#e2e8f0',
  dark_footer_color TEXT NOT NULL DEFAULT '#001a41',
  dark_footer_text_color TEXT NOT NULL DEFAULT '#e2e8f0'
);

-- Enable RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes
DROP POLICY IF EXISTS "Public read access to system_settings" ON system_settings;
DROP POLICY IF EXISTS "Insert access to system_settings" ON system_settings;
DROP POLICY IF EXISTS "Update access to system_settings" ON system_settings;
DROP POLICY IF EXISTS "Delete access to system_settings" ON system_settings;

-- Recriar políticas com leitura pública
CREATE POLICY "Public read access to system_settings"
  ON system_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Insert access to system_settings"
  ON system_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Update access to system_settings"
  ON system_settings
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Delete access to system_settings"
  ON system_settings
  FOR DELETE
  TO authenticated
  USING (true);

-- Criar bucket logos se não existir
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('logos', 'logos', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
END $$;

-- Criar política para o bucket logos
BEGIN;
  -- Remover políticas existentes
  DROP POLICY IF EXISTS "Public Access" ON storage.objects;
  DROP POLICY IF EXISTS "Upload Access" ON storage.objects;
  DROP POLICY IF EXISTS "Update Access" ON storage.objects;
  DROP POLICY IF EXISTS "Delete Access" ON storage.objects;
  
  -- Permitir acesso público para leitura
  CREATE POLICY "Public Access"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'logos' OR bucket_id = 'machine-images');

  -- Permitir upload apenas para usuários autenticados
  CREATE POLICY "Upload Access"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'logos' OR bucket_id = 'machine-images');

  -- Permitir atualização apenas para usuários autenticados
  CREATE POLICY "Update Access"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'logos' OR bucket_id = 'machine-images');

  -- Permitir deleção apenas para usuários autenticados
  CREATE POLICY "Delete Access"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'logos' OR bucket_id = 'machine-images');
COMMIT;

-- Inserir configurações padrão
INSERT INTO system_settings (
  light_header_color,
  light_header_text_color,
  light_footer_color,
  light_footer_text_color,
  dark_header_color,
  dark_header_text_color,
  dark_footer_color,
  dark_footer_text_color,
  light_header_logo_url,
  dark_header_logo_url,
  light_footer_logo_url,
  dark_footer_logo_url
) VALUES (
  '#ffffff',
  '#1e293b',
  '#f8fafc',
  '#1e293b',
  '#001a41',
  '#e2e8f0',
  '#001a41',
  '#e2e8f0',
  (SELECT publicUrl FROM storage.objects WHERE name LIKE '%light_header_logo%' ORDER BY created_at DESC LIMIT 1),
  (SELECT publicUrl FROM storage.objects WHERE name LIKE '%dark_header_logo%' ORDER BY created_at DESC LIMIT 1),
  (SELECT publicUrl FROM storage.objects WHERE name LIKE '%light_footer_logo%' ORDER BY created_at DESC LIMIT 1),
  (SELECT publicUrl FROM storage.objects WHERE name LIKE '%dark_footer_logo%' ORDER BY created_at DESC LIMIT 1)
) ON CONFLICT (id) DO UPDATE SET
  light_header_color = EXCLUDED.light_header_color,
  light_header_text_color = EXCLUDED.light_header_text_color,
  light_footer_color = EXCLUDED.light_footer_color,
  light_footer_text_color = EXCLUDED.light_footer_text_color,
  dark_header_color = EXCLUDED.dark_header_color,
  dark_header_text_color = EXCLUDED.dark_header_text_color,
  dark_footer_color = EXCLUDED.dark_footer_color,
  dark_footer_text_color = EXCLUDED.dark_footer_text_color,
  light_header_logo_url = EXCLUDED.light_header_logo_url,
  dark_header_logo_url = EXCLUDED.dark_header_logo_url,
  light_footer_logo_url = EXCLUDED.light_footer_logo_url,
  dark_footer_logo_url = EXCLUDED.dark_footer_logo_url;
