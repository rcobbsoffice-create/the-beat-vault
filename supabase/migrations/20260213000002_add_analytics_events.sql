-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'play', 'view', 'wishlist', 'cart_add', 'purchase'
  beat_id UUID REFERENCES beats(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events (event_type);

CREATE INDEX IF NOT EXISTS idx_analytics_beat_id ON analytics_events (beat_id);

CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events (user_id);

CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events (created_at);

-- Set up RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for public tracking)
CREATE POLICY "Allow public insert for analytics" ON analytics_events FOR
INSERT
WITH
    CHECK (true);

-- Only admins can view raw analytics events through this table
CREATE POLICY "Allow admins to view analytics" ON analytics_events FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );