-- Newsletters Table
CREATE TABLE IF NOT EXISTS newsletters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'producers', 'artists', 'customers')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE
);

-- RLS
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage newsletters" ON newsletters FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'admin'
    )
);