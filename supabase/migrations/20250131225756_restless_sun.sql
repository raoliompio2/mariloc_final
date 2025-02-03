/*
  # Add Rental System Tables

  1. New Tables
    - `rentals`
      - Stores active rentals
      - Links machine, client, and landlord
      - Tracks rental period and status
    - `returns`
      - Stores return requests and completed returns
      - Links to rental
      - Tracks return method and status

  2. Security
    - Enable RLS on all tables
    - Add policies for clients and landlords
*/

-- Create rentals table
CREATE TABLE rentals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id uuid REFERENCES quotes(id),
  machine_id uuid REFERENCES machines(id) NOT NULL,
  client_id uuid REFERENCES profiles(id) NOT NULL,
  landlord_id uuid REFERENCES profiles(id) NOT NULL,
  rental_period text NOT NULL,
  delivery_address text NOT NULL,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create returns table
CREATE TABLE returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id uuid REFERENCES rentals(id) NOT NULL,
  return_method text NOT NULL CHECK (return_method IN ('store', 'pickup')),
  return_address text, -- Required only for pickup
  requested_date timestamptz NOT NULL DEFAULT now(),
  completed_date timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'completed')),
  observations text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Create policies for rentals
CREATE POLICY "Rentals are viewable by involved parties"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

CREATE POLICY "Landlords can create rentals"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = landlord_id);

CREATE POLICY "Involved parties can update rentals"
  ON rentals
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  )
  WITH CHECK (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id
  );

-- Create policies for returns
CREATE POLICY "Returns are viewable by involved parties"
  ON returns
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

CREATE POLICY "Clients can create returns"
  ON returns
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_id
      AND auth.uid() = rentals.client_id
    )
  );

CREATE POLICY "Landlords can update returns"
  ON returns
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_id
      AND auth.uid() = rentals.landlord_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM rentals
      WHERE rentals.id = rental_id
      AND auth.uid() = rentals.landlord_id
    )
  );

-- Create indexes
CREATE INDEX idx_rentals_client ON rentals(client_id);
CREATE INDEX idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX idx_rentals_machine ON rentals(machine_id);
CREATE INDEX idx_rentals_quote ON rentals(quote_id);
CREATE INDEX idx_returns_rental ON returns(rental_id);

-- Create trigger for updated_at
CREATE TRIGGER update_rentals_updated_at
  BEFORE UPDATE ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_returns_updated_at
  BEFORE UPDATE ON returns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();