# Tipos de Usuários e Permissões

O sistema possui dois tipos de usuários com diferentes níveis de acesso:

## 1. Landlord (Proprietário)

O Landlord é o administrador principal do sistema, responsável por gerenciar todo o conteúdo.

### Permissões:
- ✅ Gerenciar todas as máquinas
- ✅ Criar/editar dados técnicos
- ✅ Fazer upload e gerenciar imagens
- ✅ Gerenciar categorias
- ✅ Acesso total ao sistema

### Uso:
```sql
-- Verificar se usuário é landlord
raw_user_meta_data->>'role' = 'landlord'
```

## 2. Client

O Client é o usuário final que utiliza o sistema para buscar e visualizar máquinas.

### Permissões:
- ✅ Visualizar máquinas
- ✅ Visualizar dados técnicos
- ✅ Visualizar imagens
- ✅ Usar a busca inteligente
- ❌ Não pode modificar dados
- ❌ Não pode fazer upload de imagens

### Uso:
```sql
-- Verificar se usuário é cliente
raw_user_meta_data->>'role' = 'client'
```

## Implementação no Supabase

As políticas de segurança (RLS) são baseadas na role do usuário armazenada em `raw_user_meta_data->>'role'`.

### Exemplo de Política:
```sql
CREATE POLICY "Landlord pode gerenciar" ON tabela
FOR ALL USING (
  auth.jwt()->>'role' = 'landlord'
);

CREATE POLICY "Cliente pode visualizar" ON tabela
FOR SELECT USING (true);
```

## Observações Importantes

1. Todo usuário não autenticado tem permissão de leitura (SELECT)
2. Apenas o landlord pode modificar dados (INSERT, UPDATE, DELETE)
3. A role do usuário é definida no momento do cadastro
4. As políticas são aplicadas automaticamente pelo Supabase
