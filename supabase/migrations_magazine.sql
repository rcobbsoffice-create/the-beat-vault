-- Magazine Articles Table
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Extended Artist Profiles
CREATE TABLE IF NOT EXISTS artist_profiles_ext (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  press_photo_url TEXT,
  cover_image_url TEXT,
  location TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  stats JSONB DEFAULT '{"views": "0", "chartPeak": 0, "totalTracks": 0, "listeners": "0"}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Charts Table
CREATE TABLE IF NOT EXISTS charts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rank INTEGER NOT NULL,
  last_rank INTEGER,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  image_url TEXT,
  chart_type TEXT DEFAULT 'top_100' CHECK (chart_type IN ('top_100', 'trending', 'genre', 'viral')),
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Artist Submissions
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  release_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'expedited')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE artist_profiles_ext ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Articles are viewable by everyone" ON articles FOR
SELECT USING (status = 'published');

CREATE POLICY "Admins and Editors can manage articles" ON articles FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role IN ('admin', 'editor')
    )
);

-- RLS Policies for Charts
ALTER TABLE charts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Charts are viewable by everyone" ON charts FOR
SELECT USING (TRUE);

CREATE POLICY "Admins can manage charts" ON charts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'admin'
    )
);

-- RLS Policies for Submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own submissions" ON submissions FOR
SELECT USING (auth.uid () = artist_id);

CREATE POLICY "Users can create submissions" ON submissions FOR
INSERT
WITH
    CHECK (auth.uid () = artist_id);

CREATE POLICY "Admins and Editors can manage submissions" ON submissions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role IN ('admin', 'editor')
    )
);

CREATE POLICY "Public can view artist extensions" ON artist_profiles_ext FOR
SELECT USING (TRUE);

CREATE POLICY "Artists can update own extension" ON artist_profiles_ext FOR
UPDATE USING (auth.uid () = profile_id);