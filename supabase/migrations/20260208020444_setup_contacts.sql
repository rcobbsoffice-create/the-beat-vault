-- Intelligence & Contacts Setup

-- 1. Create Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'gmail', 'csv')),
    geolocation JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(email, owner_id) -- Prevent duplicate contacts for the same owner
);

-- 2. Update Newsletters Table
ALTER TABLE newsletters
ADD COLUMN IF NOT EXISTS sender_id UUID REFERENCES profiles (id) ON DELETE SET NULL;

ALTER TABLE newsletters ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- 3. Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
DROP POLICY IF EXISTS "Admins manage all contacts" ON contacts;

CREATE POLICY "Admins manage all contacts" ON contacts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'admin'
    )
);

-- Users manage their own contacts
DROP POLICY IF EXISTS "Users manage own contacts" ON contacts;

CREATE POLICY "Users manage own contacts" ON contacts FOR ALL USING (owner_id = auth.uid ());

-- 4. Utility Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contacts_updated_at ON contacts;

CREATE TRIGGER update_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();