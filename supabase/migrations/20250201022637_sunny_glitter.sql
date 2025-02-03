-- Drop existing policies
DO $$
BEGIN
    DROP POLICY IF EXISTS "Rentals are viewable by involved parties" ON rentals;
    DROP POLICY IF EXISTS "Clients can create rentals" ON rentals;
    DROP POLICY IF EXISTS "Landlords can update their rentals" ON rentals;
    DROP POLICY IF EXISTS "Landlords can delete their rentals" ON rentals;
END $$;

-- Add price column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'rentals' AND column_name = 'price'
  ) THEN
    ALTER TABLE rentals ADD COLUMN price numeric(10,2);
  END IF;
END $$;

-- Create new policies for rentals with proper permissions
CREATE POLICY "Rentals are viewable by involved parties"
  ON rentals
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = landlord_id OR
    auth.uid() IN (
      SELECT owner_id FROM machines WHERE id = machine_id
    )
  );

CREATE POLICY "Clients can create rentals from quotes"
  ON rentals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = client_id AND
    EXISTS (
      SELECT 1 FROM quotes
      WHERE quotes.machine_id = machine_id
      AND quotes.client_id = client_id
      AND quotes.landlord_id = landlord_id
      AND quotes.status = 'answered'
    )
  );

CREATE POLICY "Landlords can manage their rentals"
  ON rentals
  FOR ALL
  TO authenticated
  USING (
    auth.uid() = landlord_id OR
    auth.uid() IN (
      SELECT owner_id FROM machines WHERE id = machine_id
    )
  )
  WITH CHECK (
    auth.uid() = landlord_id OR
    auth.uid() IN (
      SELECT owner_id FROM machines WHERE id = machine_id
    )
  );

-- Create function to validate rental status transitions
CREATE OR REPLACE FUNCTION validate_rental_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Only allow specific status transitions
  IF OLD.status = 'pending' AND NEW.status NOT IN ('active', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from pending';
  END IF;
  
  IF OLD.status = 'active' AND NEW.status NOT IN ('completed', 'cancelled') THEN
    RAISE EXCEPTION 'Invalid status transition from active';
  END IF;
  
  IF OLD.status IN ('completed', 'cancelled') AND OLD.status != NEW.status THEN
    RAISE EXCEPTION 'Cannot change status of completed or cancelled rental';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rental status validation
DROP TRIGGER IF EXISTS validate_rental_status_trigger ON rentals;
CREATE TRIGGER validate_rental_status_trigger
  BEFORE UPDATE OF status ON rentals
  FOR EACH ROW
  EXECUTE FUNCTION validate_rental_status_transition();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rentals_client ON rentals(client_id);
CREATE INDEX IF NOT EXISTS idx_rentals_landlord ON rentals(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rentals_machine ON rentals(machine_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_created_at ON rentals(created_at);