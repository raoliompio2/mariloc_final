-- Create quick_links table
CREATE TABLE IF NOT EXISTS quick_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    system_settings_id UUID REFERENCES system_settings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create featured_logos table
CREATE TABLE IF NOT EXISTS featured_logos (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    system_settings_id UUID REFERENCES system_settings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quick_links_system_settings_id ON quick_links(system_settings_id);
CREATE INDEX IF NOT EXISTS idx_featured_logos_system_settings_id ON featured_logos(system_settings_id);

-- Add RLS policies
ALTER TABLE quick_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_logos ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access for all authenticated users on quick_links"
    ON quick_links FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow read access for all authenticated users on featured_logos"
    ON featured_logos FOR SELECT
    TO authenticated
    USING (true);

-- Allow write access only to admin users
CREATE POLICY "Allow write access for admin users on quick_links"
    ON quick_links FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));

CREATE POLICY "Allow write access for admin users on featured_logos"
    ON featured_logos FOR ALL
    TO authenticated
    USING (auth.uid() IN (SELECT user_id FROM admin_users))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM admin_users));
