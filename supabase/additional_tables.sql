-- =====================================================
-- ADDITIONAL TABLES FOR EXTENDED FEATURES
-- =====================================================
-- Run this AFTER complete_schema.sql
-- These tables support the new advanced features
-- =====================================================

-- Download tokens for secure file delivery
CREATE TABLE IF NOT EXISTS download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_download_tokens_token ON download_tokens (token);

CREATE INDEX idx_download_tokens_expires ON download_tokens (expires_at);

-- RLS for download tokens
ALTER TABLE download_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "System can manage download tokens" ON download_tokens FOR ALL
WITH
    CHECK (true);

-- Daily beat statistics for analytics
CREATE TABLE IF NOT EXISTS beat_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  plays INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(beat_id, date)
);

CREATE INDEX idx_beat_daily_stats_date ON beat_daily_stats (date);

CREATE INDEX idx_beat_daily_stats_beat_id ON beat_daily_stats (beat_id);

-- RLS for beat daily stats
ALTER TABLE beat_daily_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can view own beat stats" ON beat_daily_stats FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = beat_daily_stats.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

CREATE POLICY "Admins can view all stats" ON beat_daily_stats FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- Cron job execution logs
CREATE TABLE IF NOT EXISTS cron_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'error', 'running')),
  results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_cron_logs_task ON cron_logs (task);

CREATE INDEX idx_cron_logs_created_at ON cron_logs (created_at DESC);

-- RLS for cron logs (admin only)
ALTER TABLE cron_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view cron logs" ON cron_logs FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- Email send logs
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  provider TEXT,
  provider_id TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_email_logs_status ON email_logs (status);

CREATE INDEX idx_email_logs_created_at ON email_logs (created_at DESC);

-- Processing jobs queue
CREATE TABLE IF NOT EXISTS processing_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'audio_convert', 'generate_preview', etc.
  beat_id UUID REFERENCES beats(id) ON DELETE CASCADE,
  input_url TEXT,
  output_urls JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  priority INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_processing_jobs_status ON processing_jobs (status);

CREATE INDEX idx_processing_jobs_beat_id ON processing_jobs (beat_id);

-- DSP credentials storage (encrypted in production)
CREATE TABLE IF NOT EXISTS dsp_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  dsp TEXT NOT NULL, -- 'spotify', 'youtube', 'soundcloud', etc.
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb, -- Store encrypted
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  UNIQUE(user_id, dsp)
);

-- RLS for DSP credentials
ALTER TABLE dsp_credentials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own DSP credentials" ON dsp_credentials FOR ALL USING (auth.uid () = user_id);

-- Helper function to decrement download count
CREATE OR REPLACE FUNCTION decrement_download_count(purchase_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE purchases
  SET downloads_remaining = GREATEST(COALESCE(downloads_remaining, 0) - 1, 0),
      updated_at = NOW()
  WHERE id = purchase_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- CRON JOB SETUP (Run in Supabase SQL Editor)
-- =====================================================
-- These use pg_cron extension. Enable it first:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule cron jobs (adjust timing as needed)
-- Note: These call the Edge Function via HTTP

--
-- -- Sync fingerprints every 6 hours
-- SELECT cron.schedule(
--   'sync-fingerprints',
--   '0 0,6,12,18 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "sync_fingerprints"}'::jsonb
--   );
--   $$
-- );
--
-- -- Aggregate analytics daily at midnight
-- SELECT cron.schedule(
--   'aggregate-analytics',
--   '0 0 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "aggregate_analytics"}'::jsonb
--   );
--   $$
-- );
--
-- -- Cleanup downloads daily at 2 AM
-- SELECT cron.schedule(
--   'cleanup-downloads',
--   '0 2 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "cleanup_downloads"}'::jsonb
--   );
--   $$
-- );
--
-- -- Send scheduled newsletters every hour
-- SELECT cron.schedule(
--   'send-newsletters',
--   '0 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "send_scheduled_newsletters"}'::jsonb
--   );
--   $$
-- );
--
-- -- Sync DSP distribution daily at 6 AM
-- SELECT cron.schedule(
--   'sync-distribution',
--   '0 6 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "sync_distribution"}'::jsonb
--   );
--   $$
-- );
--
-- -- Generate weekly charts on Monday at midnight
-- SELECT cron.schedule(
--   'generate-charts',
--   '0 0 * * 1',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "generate_charts"}'::jsonb
--   );
--   $$
-- );
--
-- -- Process questionnaires every 15 minutes
-- SELECT cron.schedule(
--   'process-questionnaires',
--   '0,15,30,45 * * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "process_questionnaires"}'::jsonb
--   );
--   $$
-- );
--
-- -- Update tracking summaries every 4 hours
-- SELECT cron.schedule(
--   'update-tracking-summaries',
--   '0 0,4,8,12,16,20 * * *',
--   $$
--   SELECT net.http_post(
--     url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/cron-tasks',
--     headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_CRON_SECRET"}'::jsonb,
--     body := '{"task": "update_tracking_summaries"}'::jsonb
--   );
--   $$
-- );
--

-- =====================================================
-- END OF ADDITIONAL TABLES
-- =====================================================