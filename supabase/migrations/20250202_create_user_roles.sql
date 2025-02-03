-- Drop existing policies from all tables first
DROP POLICY IF EXISTS "Allow users to view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow admins to manage roles" ON user_roles;
DROP POLICY IF EXISTS "Allow users to read their own roles" ON user_roles;
DROP POLICY IF EXISTS "Allow authenticated to read user roles" ON user_roles;
DROP POLICY IF EXISTS "Permitir escrita para admins em system_settings" ON system_settings;
DROP POLICY IF EXISTS "Admins podem gerenciar quick_links" ON quick_links;
DROP POLICY IF EXISTS "Admins podem gerenciar featured_logos" ON featured_logos;

-- Drop old tables and views
DROP TABLE IF EXISTS user_roles CASCADE;
DROP MATERIALIZED VIEW IF EXISTS admin_users CASCADE;
DROP FUNCTION IF EXISTS refresh_admin_users CASCADE;

-- Criar políticas de segurança para system_settings
DROP POLICY IF EXISTS "Permitir leitura para todos em system_settings" ON system_settings;
CREATE POLICY "Permitir leitura para todos em system_settings" ON system_settings
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Permitir escrita para admins em system_settings" ON system_settings;
CREATE POLICY "Permitir escrita para admins em system_settings" ON system_settings
  FOR ALL
  TO authenticated
  USING ((SELECT role = 'service_role' FROM auth.users WHERE auth.users.id = auth.uid()));
