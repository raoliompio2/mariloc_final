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