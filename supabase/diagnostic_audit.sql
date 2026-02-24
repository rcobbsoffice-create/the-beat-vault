-- =====================================================
-- 🕵️ DATABASE DIAGNOSTIC AUDIT
-- =====================================================
-- Please run this script and SHARE THE OUTPUT with me.
-- This will tell me exactly what tables and columns exist.
-- =====================================================

SELECT table_name, string_agg (
        column_name, ', '
        ORDER BY column_name
    ) as columns
FROM information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN (
        'beats',
        'purchases',
        'profiles',
        'audio_fingerprints',
        'track_detections',
        'download_tokens',
        'beat_daily_stats',
        'cron_logs',
        'email_logs',
        'processing_jobs',
        'dsp_credentials'
    )
GROUP BY
    table_name;