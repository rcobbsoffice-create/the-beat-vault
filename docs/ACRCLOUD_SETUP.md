# ACRCloud Audio Fingerprinting Setup Guide

## Overview

The Beat Vault integrates ACRCloud for audio fingerprinting, enabling producers to track when and where their beats are used across streaming platforms like YouTube, Spotify, SoundCloud, and TikTok.

## Getting Started

### 1. Create ACRCloud Account

1. Visit [ACRCloud Console](https://console.acrcloud.com/)
2. Sign up for an account (14-day free trial available)
3. Create a new project

### 2. Create a Music Bucket

1. In the ACRCloud console, navigate to **Audio & Video Recognition** > **Buckets**
2. Click **Create Bucket**
3. Select **Music Recognition** as the bucket type
4. Note your **Bucket ID**

### 3. Get API Credentials

1. Navigate to **Console** > **Access Keys**
2. Copy your **Access Key** and **Access Secret**
3. Note the **Host** for your region (e.g., `identify-us-west-2.acrcloud.com`)

### 4. Configure Environment Variables

Add the following to your `.env.local` file:

```bash
ACRCLOUD_ACCESS_KEY=your-acrcloud-access-key
ACRCLOUD_ACCESS_SECRET=your-acrcloud-access-secret
ACRCLOUD_BUCKET_ID=your-acrcloud-bucket-id
ACRCLOUD_HOST=identify-us-west-2.acrcloud.com
ACRCLOUD_WEBHOOK_SECRET=optional-webhook-secret
```

### 5. Deploy Database Migrations

Run the migrations to create the required tables:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually via Supabase Dashboard > SQL Editor
```

Apply these migration files in order:

1. `20260213000000_audio_fingerprints.sql`
2. `20260213000001_track_detections.sql`

### 6. Deploy Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Deploy all functions
supabase functions deploy process-fingerprint
supabase functions deploy sync-detections
supabase functions deploy webhook-acrcloud

# Set secrets for edge functions
supabase secrets set ACRCLOUD_ACCESS_KEY=your-key
supabase secrets set ACRCLOUD_ACCESS_SECRET=your-secret
supabase secrets set ACRCLOUD_BUCKET_ID=your-bucket-id
supabase secrets set ACRCLOUD_HOST=identify-us-west-2.acrcloud.com
```

### 7. Set Up Daily Sync (Optional)

To automatically sync detections daily, set up a cron job in Supabase:

1. Go to **Database** > **Cron Jobs** in Supabase Dashboard
2. Create a new cron job:
   - Name: `Sync ACRCloud Detections`
   - Schedule: `0 2 * * *` (runs at 2 AM daily)
   - Command:
     ```sql
     SELECT net.http_post(
       url := 'https://your-project.supabase.co/functions/v1/sync-detections',
       headers := jsonb_build_object('Authorization', 'Bearer YOUR_SERVICE_ROLE_KEY')
     );
     ```

### 8. Configure Webhook (Optional - Real-time)

For real-time detection notifications:

1. In ACRCloud console, navigate to **Settings** > **Webhooks**
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/webhook-acrcloud`
3. Set a webhook secret and add it to your environment variables

## How It Works

### Automatic Fingerprinting

When a producer uploads a beat:

1. Beat is uploaded to R2 storage
2. `process-fingerprint` edge function is triggered asynchronously
3. Audio file is downloaded and sent to ACRCloud
4. ACRCloud generates a unique fingerprint
5. Fingerprint is stored in the `audio_fingerprints` table
6. Producer can enable monitoring from their dashboard

### Track Monitoring

Once monitoring is enabled:

1. Daily cron job runs `sync-detections` function
2. Function queries ACRCloud for all monitored beats
3. New detections are stored in `track_detections` table
4. Producers can view analytics in their dashboard

### Analytics Views

Two views are available for querying:

- `producer_track_analytics` - Per-platform analytics
- `beat_tracking_summary` - Overall beat tracking summary

## Pricing Considerations

**ACRCloud Costs:**

- Fingerprint generation: ~$6 per 1,000 requests
- Stream monitoring: ~$26 per month per monitored stream
- 14-day free trial available

**Recommendations:**

- Start with fingerprinting all beats (one-time cost)
- Offer monitoring as a premium feature for producers
- Consider implementing usage-based pricing for producers

## Troubleshooting

### Fingerprint Generation Fails

- Check that audio file is accessible from R2
- Verify ACRCloud credentials are correct
- Ensure audio format is supported (WAV, MP3)

### No Detections Appearing

- Verify monitoring is enabled in `audio_fingerprints` table
- Check that cron job is running
- Confirm beat has been used on monitored platforms

### Edge Function Errors

- Check Supabase function logs
- Verify all secrets are set correctly
- Ensure service role key has proper permissions

## Support

- ACRCloud Documentation: https://docs.acrcloud.com/
- ACRCloud Support: support@acrcloud.com
- Supabase Edge Functions: https://supabase.com/docs/guides/functions
