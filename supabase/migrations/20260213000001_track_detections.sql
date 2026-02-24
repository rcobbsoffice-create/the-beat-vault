-- Create track detections table to log every detection of a beat across platforms
CREATE TABLE IF NOT EXISTS track_detections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    beat_id UUID REFERENCES beats (id) ON DELETE CASCADE NOT NULL,
    fingerprint_id UUID REFERENCES audio_fingerprints (id) ON DELETE CASCADE,
    platform TEXT NOT NULL, -- 'youtube', 'spotify', 'soundcloud', 'tiktok', etc.
    platform_url TEXT, -- URL where track was detected
    platform_video_id TEXT, -- Video/track ID on the platform
    platform_title TEXT, -- Title of the content where beat was detected
    platform_creator TEXT, -- Creator/channel name
    platform_metadata JSONB, -- Additional platform-specific data
    detected_at TIMESTAMPTZ NOT NULL,
    confidence_score DECIMAL(5, 2), -- 0-100 confidence from ACRCloud
    duration_seconds INTEGER, -- How long the beat was played
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_detections_beat_id ON track_detections (beat_id);

CREATE INDEX IF NOT EXISTS idx_detections_fingerprint_id ON track_detections (fingerprint_id);

CREATE INDEX IF NOT EXISTS idx_detections_platform ON track_detections (platform);

CREATE INDEX IF NOT EXISTS idx_detections_date ON track_detections (detected_at DESC);

CREATE INDEX IF NOT EXISTS idx_detections_beat_date ON track_detections (beat_id, detected_at DESC);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_detections_beat_platform_date ON track_detections (
    beat_id,
    platform,
    detected_at DESC
);

-- RLS Policies
ALTER TABLE track_detections ENABLE ROW LEVEL SECURITY;

-- Producers can view detections for their own beats
CREATE POLICY "Producers can view own beat detections" ON track_detections FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = track_detections.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

-- Admins can view all detections
CREATE POLICY "Admins can view all detections" ON track_detections FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                profiles.id = auth.uid ()
                AND profiles.role = 'admin'
        )
    );

-- Service role can insert detections (for edge functions)
-- This will be handled by service_role key, no explicit policy needed

-- Create analytics view for producer dashboard
CREATE OR REPLACE VIEW producer_track_analytics AS
SELECT
    b.producer_id,
    b.id as beat_id,
    b.title as beat_title,
    b.artwork_url,
    td.platform,
    COUNT(DISTINCT td.id) as detection_count,
    COUNT(DISTINCT td.platform_video_id) as unique_videos,
    SUM(
        COALESCE(td.duration_seconds, 0)
    ) as total_play_seconds,
    AVG(td.confidence_score) as avg_confidence,
    MAX(td.detected_at) as last_detected_at,
    MIN(td.detected_at) as first_detected_at
FROM beats b
    LEFT JOIN track_detections td ON td.beat_id = b.id
WHERE
    b.producer_id IS NOT NULL
GROUP BY
    b.producer_id,
    b.id,
    b.title,
    b.artwork_url,
    td.platform;

-- Create summary analytics view (aggregated across all platforms)
CREATE OR REPLACE VIEW beat_tracking_summary AS
SELECT
    b.id as beat_id,
    b.title,
    b.producer_id,
    b.artwork_url,
    af.monitoring_enabled,
    af.platforms as monitored_platforms,
    COUNT(DISTINCT td.id) as total_detections,
    COUNT(DISTINCT td.platform) as platforms_detected_on,
    COUNT(DISTINCT td.platform_video_id) as unique_videos,
    SUM(
        COALESCE(td.duration_seconds, 0)
    ) as total_play_seconds,
    MAX(td.detected_at) as last_detected_at
FROM
    beats b
    LEFT JOIN audio_fingerprints af ON af.beat_id = b.id
    LEFT JOIN track_detections td ON td.beat_id = b.id
GROUP BY
    b.id,
    b.title,
    b.producer_id,
    b.artwork_url,
    af.monitoring_enabled,
    af.platforms;

-- Grant view access
GRANT SELECT ON producer_track_analytics TO authenticated;

GRANT SELECT ON beat_tracking_summary TO authenticated;