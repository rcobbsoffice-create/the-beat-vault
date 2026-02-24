-- Migration: Add vocal tag fields to profiles and beats
-- Description: Adds fields for managing producer vocal tags and beat watermarking.

-- Update profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS vocal_tag_url TEXT,
ADD COLUMN IF NOT EXISTS vocal_tag_mode TEXT DEFAULT 'default' CHECK (
    vocal_tag_mode IN ('none', 'default', 'custom')
);

-- Update beats table
ALTER TABLE beats
ADD COLUMN IF NOT EXISTS watermark_enabled BOOLEAN DEFAULT true;

-- Update RLS if necessary (assuming current policies allow profile updates by owners)
-- No changes needed if existing broad policies for profiles and beats are in place.