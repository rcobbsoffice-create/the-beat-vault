import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Supabase Edge Function: process-fingerprint
 * 
 * Handles audio fingerprinting workflow asynchronously:
 * 1. Download audio from R2
 * 2. Generate ACRCloud fingerprint
 * 3. Upload to ACRCloud bucket
 * 4. Store fingerprint ID in database
 * 5. Enable monitoring if requested
 */

interface FingerprintRequest {
  beatId: string;
  enableMonitoring?: boolean;
  platforms?: string[];
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

    // Parse request
    const { beatId, enableMonitoring = false, platforms = ['youtube', 'spotify', 'soundcloud'] } =
      (await req.json()) as FingerprintRequest;

    if (!beatId) {
      return new Response(JSON.stringify({ error: 'beatId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get beat details
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .select('id, title, audio_url, producer_id')
      .eq('id', beatId)
      .single();

    if (beatError || !beat) {
      return new Response(JSON.stringify({ error: 'Beat not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Download audio from R2 (using the audio_url)
    const audioResponse = await fetch(beat.audio_url);
    if (!audioResponse.ok) {
      throw new Error('Failed to download audio file');
    }

    const audioBuffer = await audioResponse.arrayBuffer();

    // ACRCloud configuration
    const acrConfig = {
      accessKey: Deno.env.get('ACRCLOUD_ACCESS_KEY')!,
      accessSecret: Deno.env.get('ACRCLOUD_ACCESS_SECRET')!,
      bucketId: Deno.env.get('ACRCLOUD_BUCKET_ID')!,
      host: Deno.env.get('ACRCLOUD_HOST') || 'identify-us-west-2.acrcloud.com',
    };

    // Generate ACRCloud fingerprint signature
    const timestamp = Date.now();
    const stringToSign = ['POST', '/v1/fingerprints', acrConfig.accessKey, 'audio', timestamp].join('\n');
    
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

    // Upload to ACRCloud
    const formData = new FormData();
    formData.append('access_key', acrConfig.accessKey);
    formData.append('signature', signature);
    formData.append('signature_version', '1');
    formData.append('timestamp', timestamp.toString());
    formData.append('data_type', 'audio');
    formData.append('bucket_id', acrConfig.bucketId);
    formData.append('sample', new Blob([audioBuffer], { type: 'audio/wav' }), 'audio.wav');
    formData.append('title', beat.title);
    formData.append('custom_id', beat.id);

    const acrResponse = await fetch(`https://${acrConfig.host}/v1/fingerprints`, {
      method: 'POST',
      body: formData,
    });

    const acrResult = await acrResponse.json();

    if (acrResult.status?.code !== 0) {
      throw new Error(`ACRCloud error: ${acrResult.status?.msg || 'Unknown error'}`);
    }

    const fingerprintId = acrResult.data?.fingerprint_id;

    // Store fingerprint in database
    const { data: fingerprint, error: fpError } = await supabase
      .from('audio_fingerprints')
      .upsert({
        beat_id: beatId,
        acr_fingerprint_id: fingerprintId,
        fingerprint_data: acrResult.data,
        monitoring_enabled: enableMonitoring,
        platforms: enableMonitoring ? platforms : [],
      })
      .select()
      .single();

    if (fpError) {
      throw new Error(`Database error: ${fpError.message}`);
    }

    // Enable monitoring if requested
    if (enableMonitoring && fingerprintId) {
      // Note: This is a simplified version. Full implementation would call ACRCloud's monitoring API
      console.log(`Monitoring enabled for fingerprint ${fingerprintId} on platforms:`, platforms);
    }

    return new Response(
      JSON.stringify({
        success: true,
        fingerprintId,
        monitoringEnabled: enableMonitoring,
        platforms: enableMonitoring ? platforms : [],
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Fingerprint processing error:', error);
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
