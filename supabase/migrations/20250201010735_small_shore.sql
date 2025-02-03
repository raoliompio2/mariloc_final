/*
  # Adicionar campo de valor monetário para respostas de cotações

  1. Alterações
    - Adiciona coluna `response_price` na tabela `quotes` para armazenar o valor monetário da resposta
    
  2. Detalhes
    - Tipo numeric(10,2) para armazenar valores com 2 casas decimais
    - Permite valores nulos pois nem todas as cotações terão resposta
*/

-- Adiciona a coluna response_price se ela não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'quotes' AND column_name = 'response_price'
  ) THEN
    ALTER TABLE quotes ADD COLUMN response_price numeric(10,2);
  END IF;
END $$;