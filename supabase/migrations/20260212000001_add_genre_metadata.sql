-- Genre Management & Approval Workflow
CREATE TABLE IF NOT EXISTS genre_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'proposed', 'rejected')),
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed with initial popular genres
INSERT INTO
    genre_settings (name, status)
VALUES ('Trap', 'approved'),
    ('Drill', 'approved'),
    ('Hip Hop', 'approved'),
    ('R&B', 'approved'),
    ('Pop', 'approved'),
    ('Afrobeats', 'approved'),
    ('Reggaeton', 'approved'),
    ('Lo-fi', 'approved'),
    ('Rock', 'approved'),
    ('EDM', 'approved'),
    ('Country', 'approved'),
    ('Cinematic', 'approved'),
    ('Jazz', 'approved'),
    ('Soul', 'approved'),
    ('Funk', 'approved') ON CONFLICT (name) DO NOTHING;

-- RLS Policies
ALTER TABLE genre_settings ENABLE ROW LEVEL SECURITY;

-- Public can view approved genres
CREATE POLICY "Public can view approved genres" ON genre_settings FOR
SELECT USING (status = 'approved');

-- Authed producers can propose new genres
CREATE POLICY "Producers can propose genres" ON genre_settings FOR
INSERT
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND (
            SELECT role
            FROM profiles
            WHERE
                id = auth.uid ()
        ) IN ('producer', 'admin')
    );

-- Admins manage all genres
CREATE POLICY "Admins manage all genres" ON genre_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);