/*
  # Create Quotes System

  1. New Tables
    - `quotes`
      - `id` (uuid, primary key)
      - `machine_id` (uuid, references machines)
      - `client_id` (uuid, references profiles)
      - `landlord_id` (uuid, references profiles)
      - `rental_period` (text)
      - `delivery_address` (text)
      - `observations` (text, nullable)
      - `status` (text, enum: pending, answered, rejected)
      - `response` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Create necessary indexes for performance
*/

-- Drop existing objects if they exist
DO $$
BEGIN
    DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
    DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
    DROP TABLE IF EXISTS quotes CASCADE;
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

-- Enable RLS
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for better performance
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_landlord ON quotes(landlord_id);
CREATE INDEX idx_quotes_machine ON quotes(machine_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_quotes_created_at ON quotes(created_at);