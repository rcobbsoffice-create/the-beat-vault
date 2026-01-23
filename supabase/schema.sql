-- The Beat Vault Database Schema
-- PostgreSQL + Supabase

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================
-- PROFILES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (
        role IN ('artist', 'producer', 'admin')
    ),
    display_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    stripe_connect_account_id TEXT,
    stripe_onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_profiles_role ON profiles (role);

CREATE INDEX idx_profiles_stripe ON profiles (stripe_connect_account_id);

-- ===========================
-- BEATS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT,
  mood_tags TEXT[], -- Array of mood tags
  bpm INTEGER,
  key TEXT, -- e.g., "C Minor"
  duration INTEGER, -- in seconds
  audio_url TEXT NOT NULL, -- Original file in R2
  preview_url TEXT NOT NULL, -- Watermarked preview
  artwork_url TEXT,
  waveform_data JSONB, -- Waveform peaks for visualization
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  play_count INTEGER DEFAULT 0,
  metadata JSONB, -- AI-generated tags and other data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_beats_producer ON beats (producer_id);

CREATE INDEX idx_beats_status ON beats (status);

CREATE INDEX idx_beats_genre ON beats (genre);

CREATE INDEX idx_beats_created ON beats (created_at DESC);

-- ===========================
-- LICENSES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('basic', 'premium', 'exclusive')),
  price INTEGER NOT NULL, -- in cents
  terms TEXT, -- License terms
  files_included TEXT[], -- e.g., ['mp3', 'wav', 'stems']
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_licenses_beat ON licenses (beat_id);

-- ===========================
-- PURCHASES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    buyer_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    beat_id UUID NOT NULL REFERENCES beats (id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES licenses (id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT NOT NULL,
    amount_paid INTEGER NOT NULL, -- Total in cents
    platform_fee INTEGER NOT NULL, -- Platform cut in cents
    producer_payout INTEGER NOT NULL, -- Producer receives in cents
    status TEXT DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'completed',
            'refunded'
        )
    ),
    download_urls JSONB, -- Temporary download links
    download_expires_at TIMESTAMP
    WITH
        TIME ZONE,
        created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_purchases_buyer ON purchases (buyer_id);

CREATE INDEX idx_purchases_beat ON purchases (beat_id);

CREATE INDEX idx_purchases_status ON purchases (status);

-- ===========================
-- PRODUCER STOREFRONTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS producer_storefronts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    producer_id UUID NOT NULL UNIQUE REFERENCES profiles (id) ON DELETE CASCADE,
    slug TEXT NOT NULL UNIQUE,
    banner_url TEXT,
    logo_url TEXT,
    bio TEXT,
    social_links JSONB, -- e.g., { "instagram": "...", "twitter": "..." }
    theme_customization JSONB, -- Custom colors, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_storefronts_slug ON producer_storefronts (slug);

-- ===========================
-- FAVORITES TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID NOT NULL REFERENCES profiles (id) ON DELETE CASCADE,
    beat_id UUID NOT NULL REFERENCES beats (id) ON DELETE CASCADE,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        UNIQUE (user_id, beat_id)
);

-- Index
CREATE INDEX idx_favorites_user ON favorites (user_id);

CREATE INDEX idx_favorites_beat ON favorites (beat_id);

-- ===========================
-- ANALYTICS EVENTS TABLE
-- ===========================
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    event_type TEXT NOT NULL CHECK (
        event_type IN (
            'view',
            'play',
            'purchase',
            'share',
            'download'
        )
    ),
    user_id UUID REFERENCES profiles (id) ON DELETE SET NULL,
    beat_id UUID REFERENCES beats (id) ON DELETE CASCADE,
    metadata JSONB,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_analytics_type ON analytics_events (event_type);

CREATE INDEX idx_analytics_beat ON analytics_events (beat_id);

CREATE INDEX idx_analytics_created ON analytics_events (created_at DESC);

-- ===========================
-- ROW LEVEL SECURITY (RLS)
-- ===========================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

ALTER TABLE beats ENABLE ROW LEVEL SECURITY;

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

ALTER TABLE producer_storefronts ENABLE ROW LEVEL SECURITY;

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner write
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

CREATE POLICY "Users can insert own profile" ON profiles FOR
INSERT
WITH
    CHECK (auth.uid () = id);

-- Beats: Public read (published only), producer write
CREATE POLICY "Published beats are viewable by everyone" ON beats FOR
SELECT USING (
        status = 'published'
        OR producer_id = auth.uid ()
    );

CREATE POLICY "Producers can insert own beats" ON beats FOR
INSERT
WITH
    CHECK (producer_id = auth.uid ());

CREATE POLICY "Producers can update own beats" ON beats FOR
UPDATE USING (producer_id = auth.uid ());

CREATE POLICY "Producers can delete own beats" ON beats FOR DELETE USING (producer_id = auth.uid ());

-- Licenses: Public read (active only), producer write
CREATE POLICY "Active licenses are viewable by everyone" ON licenses FOR
SELECT USING (
        is_active = true
        OR EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = licenses.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

CREATE POLICY "Producers can manage licenses" ON licenses FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM beats
        WHERE
            beats.id = licenses.beat_id
            AND beats.producer_id = auth.uid ()
    )
);

-- Purchases: Buyer and producer can read
CREATE POLICY "Users can view own purchases" ON purchases FOR
SELECT USING (
        buyer_id = auth.uid ()
        OR EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = purchases.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

-- Storefronts: Public read, producer write
CREATE POLICY "Storefronts are viewable by everyone" ON producer_storefronts FOR
SELECT USING (
        is_active = true
        OR producer_id = auth.uid ()
    );

CREATE POLICY "Producers can manage own storefront" ON producer_storefronts FOR ALL USING (producer_id = auth.uid ());

-- Favorites: Owner full access
CREATE POLICY "Users can view own favorites" ON favorites FOR
SELECT USING (user_id = auth.uid ());

CREATE POLICY "Users can insert own favorites" ON favorites FOR
INSERT
WITH
    CHECK (user_id = auth.uid ());

CREATE POLICY "Users can delete own favorites" ON favorites FOR DELETE USING (user_id = auth.uid ());

-- Analytics: Insert only (for tracking)
CREATE POLICY "Anyone can insert analytics" ON analytics_events FOR
INSERT
WITH
    CHECK (true);

CREATE POLICY "Users can view analytics for own beats" ON analytics_events FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = analytics_events.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

-- ===========================
-- FUNCTIONS & TRIGGERS
-- ===========================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beats_updated_at BEFORE UPDATE ON beats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_storefronts_updated_at BEFORE UPDATE ON producer_storefronts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create profile automatically on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'artist'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Increment play count
CREATE OR REPLACE FUNCTION increment_play_count(beat_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE beats SET play_count = play_count + 1 WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql;