-- 1. Create buckets if they don't exist
INSERT INTO
    storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;

INSERT INTO
    storage.buckets (id, name, public)
VALUES (
        'beat-covers',
        'beat-covers',
        true
    ) ON CONFLICT (id) DO NOTHING;

-- 2. Set up RLS Policies for 'avatars' bucket
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;

DROP POLICY IF EXISTS "Admins have full access to avatars" ON storage.objects;

-- Allow public access to view avatars
CREATE POLICY "Public Access Avatars" ON storage.objects FOR
SELECT USING (bucket_id = 'avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR
INSERT
WITH
    CHECK (
        bucket_id = 'avatars'
        AND auth.role () = 'authenticated'
    );

-- Allow admins full control
CREATE POLICY "Admins have full access to avatars" ON storage.objects FOR ALL USING (
    bucket_id = 'avatars'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- 3. Set up RLS Policies for 'beat-covers' bucket
DROP POLICY IF EXISTS "Public Access Beat Covers" ON storage.objects;

DROP POLICY IF EXISTS "Admins have full access to beat-covers" ON storage.objects;

-- Allow public access to view covers
CREATE POLICY "Public Access Beat Covers" ON storage.objects FOR
SELECT USING (bucket_id = 'beat-covers');

-- Allow admins full control
CREATE POLICY "Admins have full access to beat-covers" ON storage.objects FOR ALL USING (
    bucket_id = 'beat-covers'
    AND EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);