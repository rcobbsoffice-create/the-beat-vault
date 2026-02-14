-- Create admin summary view for fingerprinting
CREATE OR REPLACE VIEW admin_fingerprint_global_stats AS
SELECT
    p.id as producer_id,
    p.display_name,
    COUNT(DISTINCT b.id) as beats_count,
    COUNT(DISTINCT td.id) as total_detections,
    COUNT(DISTINCT td.platform) as platforms_count,
    SUM(
        COALESCE(td.duration_seconds, 0)
    ) as total_duration_seconds,
    MAX(td.detected_at) as last_detection_at
FROM
    profiles p
    JOIN beats b ON b.producer_id = p.id
    LEFT JOIN track_detections td ON td.beat_id = b.id
WHERE
    p.role = 'producer'
GROUP BY
    p.id,
    p.display_name;

-- Platform breakdown for admin
CREATE OR REPLACE VIEW admin_fingerprint_platform_stats AS
SELECT
    td.platform,
    COUNT(*) as detection_count,
    COUNT(DISTINCT b.producer_id) as producers_count,
    COUNT(DISTINCT b.id) as beats_count,
    AVG(td.confidence_score) as avg_confidence
FROM track_detections td
    JOIN beats b ON b.id = td.beat_id
GROUP BY
    td.platform;

-- Grant access to admins
GRANT SELECT ON admin_fingerprint_global_stats TO authenticated;

GRANT SELECT ON admin_fingerprint_platform_stats TO authenticated;

-- Add comment to track_detections about geographic data
COMMENT ON COLUMN track_detections.platform_metadata IS 'Stores platform-specific data, including geographic info if available (e.g., {"region": "US-WEST", "country": "United States"})';