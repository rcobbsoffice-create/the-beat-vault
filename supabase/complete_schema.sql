-- =====================================================
-- AUDIOGENES - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This file contains all tables needed for the platform
-- Execute this in Supabase SQL Editor to set up the database
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE EXTENSION IF NOT EXISTS "pg_trgm";
-- For fuzzy text search

-- =====================================================
-- 1. CORE AUTHENTICATION & PROFILES
-- =====================================================

-- Profiles table (linked to Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'artist' CHECK (role IN ('admin', 'producer', 'artist', 'editor')),
  display_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'verified', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.raw_user_meta_data->>'role' IN ('artist', 'producer', 'admin', 'editor') 
      THEN new.raw_user_meta_data->>'role'
      ELSE 'artist'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- =====================================================
-- 2. PRODUCER PROFILES & SETTINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS producers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  store_slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  branding JSONB DEFAULT '{"tagline": "Independent Music Brand", "bio": ""}'::jsonb,
  stripe_account_id TEXT UNIQUE,
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  is_top_producer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storefront customization
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE UNIQUE,
  theme JSONB DEFAULT '{
    "id": "midnight-onyx",
    "accentColor": "#0066cc",
    "layout": "grid",
    "showMerch": true,
    "whiteLabel": false
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 3. GENRE MANAGEMENT
-- =====================================================

CREATE TABLE IF NOT EXISTS genre_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'approved' CHECK (status IN ('proposed', 'approved', 'archived')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default genres
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
    ('Cinematic', 'approved'),
    ('Soul', 'approved'),
    ('Electronic', 'approved'),
    ('Jazz', 'approved') ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. BEATS & LICENSING
-- =====================================================

CREATE TABLE IF NOT EXISTS beats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  genre TEXT NOT NULL DEFAULT 'Unknown',
  genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  bpm INTEGER,
  key TEXT,
  mood_tags TEXT[] DEFAULT ARRAY[]::TEXT[],

-- File URLs
audio_url TEXT NOT NULL,
preview_url TEXT,
artwork_url TEXT,
stems_url TEXT,

-- Metadata
status TEXT DEFAULT 'draft' CHECK (
    status IN (
        'draft',
        'published',
        'archived',
        'pending_review'
    )
),
duration_seconds INTEGER,
file_size_bytes BIGINT,

-- Analytics
play_count BIGINT DEFAULT 0,
view_count BIGINT DEFAULT 0,
favorite_count BIGINT DEFAULT 0,
purchase_count BIGINT DEFAULT 0,

-- Timestamps
created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE
);

-- Beat licenses (pricing tiers)
CREATE TABLE IF NOT EXISTS licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('basic', 'premium', 'exclusive', 'unlimited')),
  name TEXT,
  price INTEGER NOT NULL, -- in cents
  is_active BOOLEAN DEFAULT true,

-- License terms
files_included TEXT[] DEFAULT ARRAY[]::TEXT[], -- ['MP3', 'WAV', 'Stems']
  distribution_copies INTEGER, -- NULL = unlimited
  streaming_limit INTEGER, -- NULL = unlimited
  music_videos INTEGER DEFAULT 1,
  radio_stations INTEGER DEFAULT 0,
  audio_streams INTEGER, -- NULL = unlimited

-- Royalties
producer_royalty_percentage INTEGER DEFAULT 100,
  contract_file_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  UNIQUE(beat_id, type)
);

-- Beat favorites
CREATE TABLE IF NOT EXISTS beat_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, beat_id)
);

-- =====================================================
-- 5. PURCHASES & TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  license_id UUID REFERENCES licenses(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  producer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

-- Transaction details
amount_total INTEGER NOT NULL, -- Total in cents
amount_producer INTEGER NOT NULL, -- Producer's cut in cents
amount_platform INTEGER NOT NULL, -- Platform fee in cents
currency TEXT DEFAULT 'usd',

-- Stripe references
payment_intent_id TEXT UNIQUE, charge_id TEXT, transfer_id TEXT,

-- Purchase metadata
buyer_email TEXT NOT NULL,
status TEXT DEFAULT 'pending' CHECK (
    status IN (
        'pending',
        'completed',
        'refunded',
        'failed'
    )
),

-- Files delivered
download_urls JSONB DEFAULT '{}'::jsonb,
  downloads_remaining INTEGER DEFAULT 3,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 6. MERCHANDISE
-- =====================================================

CREATE TABLE IF NOT EXISTS merch_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  base_cost DECIMAL(10, 2),
  image_url TEXT,
  category TEXT DEFAULT 'Apparel',
  inventory INTEGER DEFAULT 0,

-- Printful integration
source TEXT DEFAULT 'Manual',
  supplier_product_id TEXT UNIQUE,
  variant_ids JSONB DEFAULT '[]'::jsonb,
  
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived', 'hidden')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  producer_id UUID REFERENCES producers(id) ON DELETE SET NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  shipping_address JSONB,

-- Order details
items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,

-- Status tracking
payment_status TEXT DEFAULT 'pending' CHECK (
    payment_status IN (
        'pending',
        'paid',
        'failed',
        'refunded'
    )
),
fulfillment_status TEXT DEFAULT 'pending' CHECK (
    fulfillment_status IN (
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
    )
),

-- Stripe & Printful references
payment_intent_id TEXT,
  printful_order_id TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 7. ARTIST FEATURES
-- =====================================================

CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  artist_name TEXT NOT NULL,
  bio TEXT,
  genres TEXT[] DEFAULT ARRAY[]::TEXT[],
  social_links JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

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

CREATE TABLE IF NOT EXISTS artist_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'generated', 'archived')),
  generated_content JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  genre TEXT NOT NULL,
  release_url TEXT,
  bio TEXT,
  tier TEXT DEFAULT 'standard' CHECK (tier IN ('standard', 'expedited')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 8. DISTRIBUTION & DSP INTEGRATION
-- =====================================================

CREATE TABLE IF NOT EXISTS distribution_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID, -- References beats or releases
  artist_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dsp TEXT NOT NULL, -- Spotify, Apple Music, YouTube, etc.

-- Metrics
stream_count BIGINT DEFAULT 0,
revenue_usd DECIMAL(12, 4) DEFAULT 0,

-- Geographic data
country_code TEXT, city TEXT,

-- Time period
period_start DATE,
  period_end DATE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 9. EDITORIAL & CONTENT
-- =====================================================

CREATE TABLE IF NOT EXISTS articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  featured BOOLEAN DEFAULT false,
  view_count BIGINT DEFAULT 0,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS charts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rank INTEGER NOT NULL,
  last_rank INTEGER,
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  image_url TEXT,
  chart_type TEXT DEFAULT 'top_100' CHECK (chart_type IN ('top_100', 'trending', 'genre', 'viral')),
  genre TEXT,
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 10. NEWSLETTERS & COMMUNICATION
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  html_content TEXT,
  audience TEXT NOT NULL DEFAULT 'all' CHECK (audience IN ('all', 'producers', 'artists', 'customers', 'subscribers')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sent', 'archived')),

-- Sending metadata
scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  sent_count INTEGER DEFAULT 0,
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  phone TEXT,
  source TEXT DEFAULT 'manual',
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  metadata JSONB DEFAULT '{}'::jsonb,
  subscribed BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 11. AUDIO FINGERPRINTING & TRACKING
-- =====================================================

CREATE TABLE IF NOT EXISTS audio_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE UNIQUE,
  acrcloud_fingerprint_id TEXT UNIQUE,
  fingerprint_data JSONB,
  monitoring_enabled BOOLEAN DEFAULT false,
  platforms TEXT[] DEFAULT ARRAY['youtube', 'spotify', 'soundcloud', 'tiktok']::TEXT[],
  last_scan_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS track_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
  fingerprint_id UUID REFERENCES audio_fingerprints(id) ON DELETE CASCADE,

-- Detection details
platform TEXT NOT NULL,
platform_url TEXT,
detected_at TIMESTAMP
WITH
    TIME ZONE NOT NULL,
    confidence_score DECIMAL(5, 2),

-- Content metadata
channel_name TEXT,
video_title TEXT,
upload_date TIMESTAMP
WITH
    TIME ZONE,
    view_count BIGINT DEFAULT 0,

-- Status
status TEXT DEFAULT 'detected' CHECK (
    status IN (
        'detected',
        'claimed',
        'disputed',
        'resolved',
        'ignored'
    )
),
claim_status TEXT,

-- Revenue
estimated_revenue DECIMAL(10, 2) DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS beat_tracking_summary (
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE PRIMARY KEY,
  total_detections INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  total_estimated_revenue DECIMAL(12, 2) DEFAULT 0,
  platforms_detected JSONB DEFAULT '{}'::jsonb,
  last_detection_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 12. ANALYTICS
-- =====================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_analytics_events_type ON analytics_events (event_type);

CREATE INDEX idx_analytics_events_beat_id ON analytics_events (beat_id);

CREATE INDEX idx_analytics_events_created_at ON analytics_events (created_at);

-- Admin analytics views
CREATE TABLE IF NOT EXISTS admin_fingerprint_global_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  total_tracked_beats INTEGER DEFAULT 0,
  total_detections INTEGER DEFAULT 0,
  total_platforms INTEGER DEFAULT 0,
  total_estimated_revenue DECIMAL(12, 2) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_fingerprint_platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform TEXT NOT NULL,
  detection_count INTEGER DEFAULT 0,
  total_views BIGINT DEFAULT 0,
  estimated_revenue DECIMAL(12, 2) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 13. AUDIO VISUALIZATION
-- =====================================================

CREATE TABLE IF NOT EXISTS pulse_data (
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE PRIMARY KEY,
  bpm INTEGER,
  bass_energy JSONB,
  rms_loudness JSONB,
  pulses JSONB,
  spectral_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =====================================================
-- 14. INDEXES FOR PERFORMANCE
-- =====================================================

-- Beats indexes
CREATE INDEX IF NOT EXISTS idx_beats_producer_id ON beats (producer_id);

CREATE INDEX IF NOT EXISTS idx_beats_status ON beats (status);

CREATE INDEX IF NOT EXISTS idx_beats_genre ON beats (genre);

CREATE INDEX IF NOT EXISTS idx_beats_created_at ON beats (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_beats_play_count ON beats (play_count DESC);

-- Licenses indexes
CREATE INDEX IF NOT EXISTS idx_licenses_beat_id ON licenses (beat_id);

-- Purchases indexes
CREATE INDEX IF NOT EXISTS idx_purchases_buyer_id ON purchases (buyer_id);

CREATE INDEX IF NOT EXISTS idx_purchases_producer_id ON purchases (producer_id);

CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases (created_at DESC);

-- Fingerprints indexes
CREATE INDEX IF NOT EXISTS idx_fingerprints_beat_id ON audio_fingerprints (beat_id);

CREATE INDEX IF NOT EXISTS idx_detections_beat_id ON track_detections (beat_id);

CREATE INDEX IF NOT EXISTS idx_detections_platform ON track_detections (platform);

-- =====================================================
-- 15. HELPER FUNCTIONS
-- =====================================================

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET play_count = COALESCE(play_count, 0) + 1,
      updated_at = NOW()
  WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET view_count = COALESCE(view_count, 0) + 1,
      updated_at = NOW()
  WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update favorite count
CREATE OR REPLACE FUNCTION update_favorite_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE beats
    SET favorite_count = COALESCE(favorite_count, 0) + 1
    WHERE id = NEW.beat_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE beats
    SET favorite_count = GREATEST(COALESCE(favorite_count, 0) - 1, 0)
    WHERE id = OLD.beat_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_favorite_change ON beat_favorites;

CREATE TRIGGER on_favorite_change
  AFTER INSERT OR DELETE ON beat_favorites
  FOR EACH ROW EXECUTE FUNCTION update_favorite_count();

-- =====================================================
-- END OF SCHEMA
-- =====================================================