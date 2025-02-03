-- Add missing columns to machines table
ALTER TABLE machines ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES profiles(id);

-- Add missing columns to quotes table
ALTER TABLE quotes ADD COLUMN IF NOT EXISTS landlord_id uuid REFERENCES profiles(id);

-- Add missing columns to rentals table
ALTER TABLE rentals ADD COLUMN IF NOT EXISTS landlord_id uuid REFERENCES profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_machines_owner_id ON machines(owner_id);
CREATE INDEX IF NOT EXISTS idx_quotes_landlord_id ON quotes(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord_id ON rentals(landlord_id);