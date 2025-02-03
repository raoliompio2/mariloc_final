-- Drop existing policies
DROP POLICY IF EXISTS "Public read access to machines" ON machines;
DROP POLICY IF EXISTS "Admin manage machines" ON machines;

-- Create new policies
CREATE POLICY "Public read access to machines" ON machines
FOR SELECT USING (true);

CREATE POLICY "Admin manage machines" ON machines
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
) WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Update machine_images policies
DROP POLICY IF EXISTS "Allow owners to delete machine images" ON machine_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert machine images" ON machine_images;

CREATE POLICY "Allow admins to delete machine images" ON machine_images
FOR DELETE USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Allow admins to insert machine images" ON machine_images
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);

-- Update storage policies
DROP POLICY IF EXISTS "Allow owners to delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;

CREATE POLICY "Allow admins to delete" ON storage.objects
FOR DELETE USING (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);

CREATE POLICY "Allow admins to upload" ON storage.objects
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND 
  auth.uid() IN (SELECT user_id FROM admin_users)
);
