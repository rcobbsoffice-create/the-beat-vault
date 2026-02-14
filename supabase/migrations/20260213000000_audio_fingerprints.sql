-- Create audio fingerprints table to store ACRCloud fingerprint data
CREATE TABLE IF NOT EXISTS audio_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE NOT NULL UNIQUE,
  acr_fingerprint_id TEXT, -- ACRCloud's unique fingerprint ID
  fingerprint_data JSONB, -- Raw fingerprint metadata from ACRCloud
  monitoring_enabled BOOLEAN DEFAULT false,
  platforms TEXT[] DEFAULT '{}', -- Platforms being monitored: youtube, spotify, soundcloud, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_fingerprints_beat_id ON audio_fingerprints (beat_id);

CREATE INDEX IF NOT EXISTS idx_fingerprints_acr_id ON audio_fingerprints (acr_fingerprint_id);

CREATE INDEX IF NOT EXISTS idx_fingerprints_monitoring ON audio_fingerprints (monitoring_enabled)
WHERE
    monitoring_enabled = true;

-- RLS Policies
ALTER TABLE audio_fingerprints ENABLE ROW LEVEL SECURITY;

-- Producers can view their own beat fingerprints
CREATE POLICY "Producers can view own beat fingerprints" ON audio_fingerprints FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = audio_fingerprints.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

-- Producers can update their own beat fingerprints
CREATE POLICY "Producers can update own beat fingerprints" ON audio_fingerprints FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM beats
        WHERE
            beats.id = audio_fingerprints.beat_id
            AND beats.producer_id = auth.uid ()
    )
);

-- Admins can manage all fingerprints
CREATE POLICY "Admins can manage all fingerprints" ON audio_fingerprints FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            profiles.id = auth.uid ()
            AND profiles.role = 'admin'
    )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_fingerprint_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER fingerprint_updated_at
  BEFORE UPDATE ON audio_fingerprints
  FOR EACH ROW
  EXECUTE FUNCTION update_fingerprint_updated_at();