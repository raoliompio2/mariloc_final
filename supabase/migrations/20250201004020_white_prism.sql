-- Drop existing tables and dependencies
DO $$
BEGIN
    DROP TABLE IF EXISTS quote_accessories CASCADE;
    DROP TABLE IF EXISTS quotes CASCADE;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
END $$;

-- Create quotes table
CREATE TABLE quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  landlord_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rental_period text NOT NULL,
  delivery_address text NOT NULL,
  observations text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'rejected')),
  response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_accessories ENABLE ROW LEVEL SECURITY;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for quotes
CREATE TRIGGER update_quotes_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create policies for quotes
CREATE POLICY "Quotes are viewable by involved parties"
  ON quotes
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "Clients can create quotes"
  ON quotes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Landlords can update their quotes"
  ON quotes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = landlord_id);

-- Create policies for quote_accessories
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

CREATE POLICY "Clients can manage their quote accessories"
  ON quote_accessories
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.id = quote_id
      AND auth.uid() = quotes.client_id
      AND quotes.status = 'pending'
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_landlord ON quotes(landlord_id);
CREATE INDEX idx_quotes_machine ON quotes(machine_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);
CREATE INDEX idx_quote_accessories_quote ON quote_accessories(quote_id);
CREATE INDEX idx_quote_accessories_accessory ON quote_accessories(accessory_id);