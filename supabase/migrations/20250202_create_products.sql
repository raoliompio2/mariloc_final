-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    tags TEXT[],
    image_url TEXT,
    price DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add trigger for updated_at
DO $$ BEGIN
    CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow public read access to products" ON products;
    DROP POLICY IF EXISTS "Allow admins to manage products" ON products;
EXCEPTION
    WHEN undefined_table THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

-- Create policies for products
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT
    USING (true);

CREATE POLICY "Allow admins to manage products" ON products
    FOR ALL
    USING (
        auth.role() = 'authenticated' AND 
        auth.uid() IN (SELECT user_id FROM admin_users)
    );
