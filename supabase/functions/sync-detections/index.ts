import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Supabase Edge Function: sync-detections
 * 
 * Scheduled function (runs daily via cron) to sync detections from ACRCloud
 * Fetches detections for all monitored beats and stores them in the database
 */

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

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all beats with monitoring enabled
    const { data: fingerprints, error: fpError } = await supabase
      .from('audio_fingerprints')
      .select('id, beat_id, acr_fingerprint_id, platforms')
      .eq('monitoring_enabled', true)
      .not('acr_fingerprint_id', 'is', null);

    if (fpError) {
      throw new Error(`Database error: ${fpError.message}`);
    }

    if (!fingerprints || fingerprints.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No monitored beats found', processed: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // ACRCloud configuration
    const acrConfig = {
      accessKey: Deno.env.get('ACRCLOUD_ACCESS_KEY')!,
      accessSecret: Deno.env.get('ACRCLOUD_ACCESS_SECRET')!,
      bucketId: Deno.env.get('ACRCLOUD_BUCKET_ID')!,
      host: Deno.env.get('ACRCLOUD_HOST') || 'identify-us-west-2.acrcloud.com',
    };

    // Date range for query (last 24 hours)
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const results = {
      processed: 0,
      newDetections: 0,
      errors: 0,
    };

    // Process each fingerprint
    for (const fp of fingerprints) {
      try {
        // Generate signature for ACRCloud API
        const timestamp = Date.now();
        const uri = '/v1/monitoring/detections';
        const stringToSign = ['GET', uri, acrConfig.accessKey, 'audio', timestamp].join('\n');
        
        const encoder = new TextEncoder();
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode(acrConfig.accessSecret),
          { name: 'HMAC', hash: 'SHA-1' },
          false,
          ['sign']
        );
        
        const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(stringToSign));
        const signature = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

        // Query ACRCloud for detections
        const params = new URLSearchParams({
          access_key: acrConfig.accessKey,
          signature,
          signature_version: '1',
          timestamp: timestamp.toString(),
          fingerprint_id: fp.acr_fingerprint_id!,
          bucket_id: acrConfig.bucketId,
          start_date: yesterday.toISOString().split('T')[0],
          end_date: now.toISOString().split('T')[0],
        });

        const acrResponse = await fetch(`https://${acrConfig.host}${uri}?${params.toString()}`);
        const acrResult = await acrResponse.json();

        if (acrResult.status?.code === 0 && acrResult.data?.detections) {
          // Process detections
          const detections = acrResult.data.detections;

          for (const detection of detections) {
            // Insert detection into database (using upsert to avoid duplicates)
            const { error: insertError } = await supabase.from('track_detections').insert({
              beat_id: fp.beat_id,
              fingerprint_id: fp.id,
              platform: detection.platform || 'unknown',
              platform_url: detection.url,
              platform_video_id: detection.video_id || detection.track_id,
              platform_title: detection.title,
              platform_creator: detection.creator || detection.channel,
              platform_metadata: detection,
              detected_at: detection.detected_at || new Date().toISOString(),
              confidence_score: detection.score || 0,
              duration_seconds: detection.duration,
            });

            if (!insertError) {
              results.newDetections++;
            }
          }
        }

        results.processed++;
      } catch (error: any) {
        console.error(`Error processing fingerprint ${fp.id}:`, error);
        results.errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} fingerprints`,
        results,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Sync detections error:', error);
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
