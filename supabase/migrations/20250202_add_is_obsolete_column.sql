-- Adicionar coluna is_obsolete
ALTER TABLE technical_data 
ADD COLUMN IF NOT EXISTS is_obsolete boolean DEFAULT false;
