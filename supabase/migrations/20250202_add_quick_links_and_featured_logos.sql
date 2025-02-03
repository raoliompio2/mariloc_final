-- Criar extensão para UUID se ainda não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist to avoid conflicts
DROP TABLE IF EXISTS quick_links CASCADE;
DROP TABLE IF EXISTS featured_logos CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;

-- Criar tabela para configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    light_header_color TEXT NOT NULL DEFAULT '#001a41',
    light_header_text_color TEXT NOT NULL DEFAULT '#ffffff',
    light_footer_color TEXT NOT NULL DEFAULT '#001a41',
    light_footer_text_color TEXT NOT NULL DEFAULT '#ffffff',
    dark_header_color TEXT NOT NULL DEFAULT '#001a41',
    dark_header_text_color TEXT NOT NULL DEFAULT '#ffffff',
    dark_footer_color TEXT NOT NULL DEFAULT '#001a41',
    dark_footer_text_color TEXT NOT NULL DEFAULT '#ffffff',
    light_header_logo_url TEXT NOT NULL DEFAULT '',
    light_footer_logo_url TEXT NOT NULL DEFAULT '',
    dark_header_logo_url TEXT NOT NULL DEFAULT '',
    dark_footer_logo_url TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    quick_links_enabled BOOLEAN DEFAULT true,
    featured_logos_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de quick_links
CREATE TABLE IF NOT EXISTS quick_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_settings_id UUID NOT NULL REFERENCES system_settings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar tabela de featured_logos
CREATE TABLE IF NOT EXISTS featured_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_settings_id UUID NOT NULL REFERENCES system_settings(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_logos ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança para system_settings
DROP POLICY IF EXISTS "Permitir leitura para todos em system_settings" ON system_settings;
CREATE POLICY "Permitir leitura para todos em system_settings" ON system_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita para admins em system_settings" ON system_settings;
CREATE POLICY "Permitir escrita para admins em system_settings" ON system_settings
  FOR ALL
  TO authenticated
  USING (true);

-- Criar políticas de segurança para quick_links
DROP POLICY IF EXISTS "Todos podem visualizar quick_links" ON quick_links;
CREATE POLICY "Todos podem visualizar quick_links" ON quick_links
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins podem gerenciar quick_links" ON quick_links;
CREATE POLICY "Admins podem gerenciar quick_links" ON quick_links
  FOR ALL
  TO authenticated
  USING (true);

-- Criar políticas de segurança para featured_logos
DROP POLICY IF EXISTS "Todos podem visualizar featured_logos" ON featured_logos;
CREATE POLICY "Todos podem visualizar featured_logos" ON featured_logos
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins podem gerenciar featured_logos" ON featured_logos;
CREATE POLICY "Admins podem gerenciar featured_logos" ON featured_logos
  FOR ALL
  TO authenticated
  USING (true);

-- Create functions to handle JSON arrays
CREATE OR REPLACE FUNCTION get_quick_links(settings_row system_settings)
RETURNS SETOF quick_links AS $$
  SELECT q.*
  FROM quick_links q
  WHERE q.system_settings_id = settings_row.id
  ORDER BY q.order_index;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION get_featured_logos(settings_row system_settings)
RETURNS SETOF featured_logos AS $$
  SELECT f.*
  FROM featured_logos f
  WHERE f.system_settings_id = settings_row.id
  ORDER BY f.order_index;
$$ LANGUAGE sql STABLE;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_system_settings_updated_at
        BEFORE UPDATE ON system_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_quick_links_updated_at ON quick_links;
CREATE TRIGGER update_quick_links_updated_at
  BEFORE UPDATE ON quick_links
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_featured_logos_updated_at ON featured_logos;
CREATE TRIGGER update_featured_logos_updated_at
  BEFORE UPDATE ON featured_logos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Inserir configurações padrão se não existir
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
    light_footer_logo_url,
    dark_header_logo_url,
    dark_footer_logo_url,
    address,
    phone,
    email,
    quick_links_enabled,
    featured_logos_enabled
)
SELECT
    '#001a41',
    '#ffffff',
    '#001a41',
    '#ffffff',
    '#001a41',
    '#ffffff',
    '#001a41',
    '#ffffff',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM system_settings);

-- Notify PostgREST to refresh its schema cache
NOTIFY pgrst, 'reload schema';
