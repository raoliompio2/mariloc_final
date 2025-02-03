-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can read technical data" ON technical_data;
DROP POLICY IF EXISTS "Users can insert technical data for their machines" ON technical_data;
DROP POLICY IF EXISTS "Users can update technical data for their machines" ON technical_data;
DROP POLICY IF EXISTS "Users can delete technical data for their machines" ON technical_data;

-- Create new policies using admin_users table
CREATE POLICY "Anyone can read technical data" ON technical_data
FOR SELECT USING (true);

CREATE POLICY "Allow admins to insert technical data" ON technical_data
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Allow admins to update technical data" ON technical_data
FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
) WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Allow admins to delete technical data" ON technical_data
FOR DELETE USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);
