-- Distribution Data Table
CREATE TABLE IF NOT EXISTS distribution_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_id UUID, -- References beats or other assets
  dsp TEXT NOT NULL, -- Spotify, Apple Music, Tidal, etc.
  stream_count BIGINT DEFAULT 0,
  revenue_usd DECIMAL(12, 4) DEFAULT 0,
  country_code TEXT,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS
ALTER TABLE distribution_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all distribution data" ON distribution_data;

CREATE POLICY "Admins view all distribution data" ON distribution_data FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Artists view own distribution data" ON distribution_data;

CREATE POLICY "Artists view own distribution data" ON distribution_data FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = distribution_data.asset_id
                AND beats.producer_id = auth.uid () -- Simplified logic
        )
    );