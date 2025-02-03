-- Drop existing tables and dependencies if they exist
DO $$
BEGIN
    -- Drop tables if they exist
    DROP TABLE IF EXISTS rental_accessories CASCADE;
    DROP TABLE IF EXISTS quote_accessories CASCADE;
END $$;

-- Create rental_accessories table
CREATE TABLE rental_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id) ON DELETE CASCADE NOT NULL,
  accessory_id uuid REFERENCES accessories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(rental_id, accessory_id)
);

-- Create quote_accessories table
CREATE TABLE quote_accessories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id) ON DELETE CASCADE NOT NULL,
  accessory_id uuid REFERENCES accessories(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(quote_id, accessory_id)
);

-- Enable RLS
ALTER TABLE rental_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_accessories ENABLE ROW LEVEL SECURITY;

-- Create policies for rental_accessories
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rental accessories are viewable by involved parties" ON rental_accessories;
    CREATE POLICY "Rental accessories are viewable by involved parties"
      ON rental_accessories
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM rentals
          WHERE rentals.id = rental_id
          AND (
            auth.uid() = rentals.client_id OR
            auth.uid() = rentals.landlord_id
          )
        )
      );

    DROP POLICY IF EXISTS "Landlords can manage rental accessories" ON rental_accessories;
    CREATE POLICY "Landlords can manage rental accessories"
      ON rental_accessories
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM rentals
          WHERE rentals.id = rental_id
          AND auth.uid() = rentals.landlord_id
        )
      );
END $$;

-- Create policies for quote_accessories
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quote accessories are viewable by involved parties" ON quote_accessories;
    CREATE POLICY "Quote accessories are viewable by involved parties"
      ON quote_accessories
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_id
          AND (
            auth.uid() = quotes.client_id OR
            auth.uid() = quotes.landlord_id
          )
        )
      );

    DROP POLICY IF EXISTS "Clients can create quote accessories" ON quote_accessories;
    CREATE POLICY "Clients can create quote accessories"
      ON quote_accessories
      FOR INSERT
      TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM quotes
          WHERE quotes.id = quote_id
          AND auth.uid() = quotes.client_id
        )
      );
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rental_accessories_rental ON rental_accessories(rental_id);
CREATE INDEX IF NOT EXISTS idx_rental_accessories_accessory ON rental_accessories(accessory_id);
CREATE INDEX IF NOT EXISTS idx_quote_accessories_quote ON quote_accessories(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_accessories_accessory ON quote_accessories(accessory_id);