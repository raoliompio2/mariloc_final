-- Create accessory_machines table for N:N relationship
CREATE TABLE IF NOT EXISTS accessory_machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessory_id uuid REFERENCES accessories(id) ON DELETE CASCADE NOT NULL,
  machine_id uuid REFERENCES machines(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(accessory_id, machine_id)
);

-- Enable RLS
ALTER TABLE accessory_machines ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Accessory machines are viewable by everyone"
  ON accessory_machines
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Users can manage their accessory machines"
  ON accessory_machines
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM accessories
      WHERE accessories.id = accessory_id
      AND accessories.owner_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX idx_accessory_machines_accessory ON accessory_machines(accessory_id);
CREATE INDEX idx_accessory_machines_machine ON accessory_machines(machine_id);

-- Drop machine_id from accessories table
ALTER TABLE accessories DROP COLUMN IF EXISTS machine_id;