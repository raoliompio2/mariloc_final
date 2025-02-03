/*
  # Adicionar campo type à tabela categories

  1. Alterações
    - Adiciona campo `type` à tabela `categories` com validação para 'primary' ou 'secondary'
    - Define valor padrão 'primary' para registros existentes
  
  2. Notas
    - Usa DO block para verificar existência do campo antes de adicionar
    - Mantém compatibilidade com dados existentes
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'type'
  ) THEN
    -- Adiciona a coluna type com valor padrão 'primary'
    ALTER TABLE categories ADD COLUMN type text DEFAULT 'primary';
    
    -- Atualiza registros existentes
    UPDATE categories SET type = 'primary' WHERE type IS NULL;
    
    -- Adiciona a constraint CHECK após atualizar os dados
    ALTER TABLE categories 
      ALTER COLUMN type SET NOT NULL,
      ADD CONSTRAINT categories_type_check 
      CHECK (type IN ('primary', 'secondary'));
  END IF;
END $$;