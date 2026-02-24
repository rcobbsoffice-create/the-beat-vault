import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Supabase Edge Function: webhook-acrcloud
 * 
 * Webhook endpoint for real-time ACRCloud detection notifications
 * ACRCloud can push detection events here instead of polling
 */

interface ACRCloudWebhook {
  fingerprint_id: string;
  detections: Array<{
    platform: string;
    url?: string;
    video_id?: string;
    track_id?: string;
    title?: string;
    creator?: string;
    channel?: string;
    detected_at: string;
    score?: number;
    duration?: number;
    [key: string]: any;
  }>;
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      });
    }

    // Verify webhook signature (if ACRCloud provides one)
    const signature = req.headers.get('x-acrcloud-signature');
    const webhookSecret = Deno.env.get('ACRCLOUD_WEBHOOK_SECRET');
    
    if (webhookSecret && signature) {
      // Implement signature verification here
      // This depends on ACRCloud's webhook signature method
    }

    // Parse webhook payload
    const payload = (await req.json()) as ACRCloudWebhook;

    if (!payload.fingerprint_id || !payload.detections) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the fingerprint in our database
    const { data: fingerprint, error: fpError } = await supabase
      .from('audio_fingerprints')
      .select('id, beat_id')
      .eq('acr_fingerprint_id', payload.fingerprint_id)
      .single();

    if (fpError || !fingerprint) {
      console.error('Fingerprint not found:', payload.fingerprint_id);
      return new Response(JSON.stringify({ error: 'Fingerprint not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Insert detections
    const detectionsToInsert = payload.detections.map((detection) => ({
      beat_id: fingerprint.beat_id,
      fingerprint_id: fingerprint.id,
      platform: detection.platform || 'unknown',
      platform_url: detection.url,
      platform_video_id: detection.video_id || detection.track_id,
      platform_title: detection.title,
      platform_creator: detection.creator || detection.channel,
      platform_metadata: detection,
      detected_at: detection.detected_at || new Date().toISOString(),
      confidence_score: detection.score || 0,
      duration_seconds: detection.duration,
    }));

    const { error: insertError } = await supabase
      .from('track_detections')
      .insert(detectionsToInsert);

    if (insertError) {
      throw new Error(`Database error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${detectionsToInsert.length} detections`,
        fingerprintId: payload.fingerprint_id,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
