-- Artist Questionnaires Table
CREATE TABLE IF NOT EXISTS artist_questionnaires (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'generated', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE artist_questionnaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own questionnaires" ON artist_questionnaires;

CREATE POLICY "Users can manage own questionnaires" ON artist_questionnaires FOR ALL USING (auth.uid () = artist_id);

DROP POLICY IF EXISTS "Admins and Editors view all questionnaires" ON artist_questionnaires;

CREATE POLICY "Admins and Editors view all questionnaires" ON artist_questionnaires FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Admins and Editors update questionnaires" ON artist_questionnaires;

CREATE POLICY "Admins and Editors update questionnaires" ON artist_questionnaires FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role IN ('admin', 'editor')
    )
);