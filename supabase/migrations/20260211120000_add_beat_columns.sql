-- Add missing columns to beats table if they don't exist
ALTER TABLE beats
ADD COLUMN IF NOT EXISTS price DECIMAL(10, 2) DEFAULT 49.99,
ADD COLUMN IF NOT EXISTS bpm INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS key TEXT,
ADD COLUMN IF NOT EXISTS genre TEXT DEFAULT 'Hip Hop',
ADD COLUMN IF NOT EXISTS mood_tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS artwork_url TEXT,
ADD COLUMN IF NOT EXISTS stems_url TEXT,
ADD COLUMN IF NOT EXISTS preview_url TEXT;

-- Ensure RLS allows reading these (though Admin function bypasses it)
-- Just a sanity check for future public access
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;