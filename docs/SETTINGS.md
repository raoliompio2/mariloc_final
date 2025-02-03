# Sistema de Configurações

Este documento descreve o sistema de configurações do projeto, incluindo sua arquitetura, componentes principais e fluxo de dados.

## Visão Geral

O sistema de configurações permite gerenciar:
- Temas (claro e escuro)
- Cores de cabeçalho e rodapé
- Logos
- Informações de contato
- Links rápidos
- Logos em destaque

## Estrutura do Banco de Dados

### Tabela: system_settings

Tabela principal que armazena todas as configurações do sistema.

```sql
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  light_header_color TEXT,
  light_header_text_color TEXT,
  light_footer_color TEXT,
  light_footer_text_color TEXT,
  dark_header_color TEXT,
  dark_header_text_color TEXT,
  dark_footer_color TEXT,
  dark_footer_text_color TEXT,
  light_header_logo_url TEXT,
  light_footer_logo_url TEXT,
  dark_header_logo_url TEXT,
  dark_footer_logo_url TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  quick_links_enabled BOOLEAN,
  featured_logos_enabled BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: quick_links

Armazena os links rápidos associados às configurações.

```sql
CREATE TABLE quick_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_settings_id UUID REFERENCES system_settings(id),
  title TEXT,
  url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Tabela: featured_logos

Armazena os logos em destaque.

```sql
CREATE TABLE featured_logos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_settings_id UUID REFERENCES system_settings(id),
  title TEXT,
  image_url TEXT,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Arquitetura Frontend

### Estado Global (Redux)

O estado das configurações é gerenciado pelo Redux através do `themeSlice.ts`:

```typescript
interface ThemeState {
  theme: 'light' | 'dark';
  systemSettings: SystemSettings;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}
```

### Principais Componentes

1. `Settings.tsx`: Página principal de configurações
   - Gerencia o estado local vs estado global
   - Controla uploads de arquivos
   - Coordena salvamento de alterações

2. `ThemeSection.tsx`: Configurações de tema
   - Cores do cabeçalho e rodapé
   - Upload de logos
   - Preview das cores

3. `ContactInfo.tsx`: Informações de contato
   - Endereço
   - Telefone
   - Email

4. `QuickLinks.tsx`: Gerenciamento de links rápidos
   - Adicionar/remover links
   - Ordenar links
   - Habilitar/desabilitar seção

5. `FeaturedLogos.tsx`: Gerenciamento de logos em destaque
   - Upload de imagens
   - Ordenar logos
   - Habilitar/desabilitar seção

## Fluxo de Dados

1. **Carregamento Inicial**
   ```typescript
   // themeSlice.ts
   export const fetchSystemSettings = createAsyncThunk(
     'theme/fetchSystemSettings',
     async () => {
       const response = await getSystemSettings();
       return response;
     }
   );
   ```

2. **Salvamento de Alterações**
   ```typescript
   // Settings.tsx
   const handleSaveChanges = async () => {
     await dispatch(updateSettings(localSettings)).unwrap();
   };
   ```

3. **Upload de Arquivos**
   - Arquivos são enviados para o bucket 'logos' no Supabase Storage
   - URLs públicas são salvas nas configurações

## Políticas de Segurança (RLS)

```sql
-- Leitura permitida para todos usuários autenticados
CREATE POLICY "Permitir leitura para todos" ON system_settings
  FOR SELECT TO authenticated USING (true);

-- Escrita permitida apenas para admins
CREATE POLICY "Permitir escrita para admins" ON system_settings
  FOR ALL TO authenticated
  USING (auth.role() = 'service_role');
```

## Manutenção e Troubleshooting

### Problemas Comuns

1. **Configurações não aparecem após salvar**
   - Verificar se o estado local está sendo atualizado corretamente
   - Verificar se o Redux está recebendo e atualizando o estado
   - Checar console por erros de API

2. **Uploads de arquivo falham**
   - Verificar permissões do bucket no Supabase
   - Verificar tamanho máximo do arquivo
   - Verificar tipos de arquivo permitidos

3. **Permissões de acesso**
   - Verificar role do usuário em auth.users
   - Verificar políticas RLS no Supabase

### Adicionando Novas Configurações

1. Atualizar a interface `SystemSettings`
2. Adicionar campos na tabela `system_settings`
3. Atualizar `defaultSettings` no Redux
4. Criar/atualizar componentes de UI
5. Atualizar funções de salvamento se necessário

## Boas Práticas

1. **Estado Local vs Global**
   - Use estado local para mudanças em andamento
   - Só atualize o Redux após confirmar alterações
   - Mantenha validações no frontend e backend

2. **Performance**
   - Evite renders desnecessários
   - Use memo/useMemo para componentes pesados
   - Otimize uploads de imagem

3. **Segurança**
   - Sempre valide inputs
   - Mantenha políticas RLS atualizadas
   - Limite tamanho de uploads

4. **UX**
   - Mostre feedback de salvamento
   - Previna perda de alterações não salvas
   - Mantenha preview atualizado
