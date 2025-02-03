-- Enable RLS
ALTER TABLE machine_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow authenticated users to view machine images" ON machine_images;
DROP POLICY IF EXISTS "Allow authenticated users to insert machine images" ON machine_images;
DROP POLICY IF EXISTS "Allow owners to delete machine images" ON machine_images;

-- Create policies for machine_images table
CREATE POLICY "Allow authenticated users to view machine images"
ON machine_images
FOR SELECT
USING (
    auth.role() = 'authenticated'
);

CREATE POLICY "Allow authenticated users to insert machine images"
ON machine_images
FOR INSERT
WITH CHECK (
    auth.role() = 'authenticated'
);

CREATE POLICY "Allow owners to delete machine images"
ON machine_images
FOR DELETE
USING (
    auth.role() = 'authenticated' AND
    EXISTS (
        SELECT 1 FROM machines m
        WHERE m.id = machine_images.machine_id
        AND (
            m.owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM profiles p
                WHERE p.id = auth.uid()
                AND p.role = 'landlord'
            )
        )
    )
);

-- Ensure storage policies are set correctly
INSERT INTO storage.buckets (id, name, public)
VALUES ('machine-images', 'machine-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policies for machine-images bucket
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow owners to delete" ON storage.objects;

CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'machine-images' );

CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'machine-images'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow owners to delete"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'machine-images'
    AND auth.role() = 'authenticated'
);
