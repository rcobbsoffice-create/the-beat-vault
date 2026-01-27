-- Allow anyone to view display_name and avatar_url of any profile
-- This is necessary for articles to display author names to public users
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (TRUE);