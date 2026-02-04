import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function HEAD(request: NextRequest, context: { params: Promise<{ beatId: string }> }) {
  return GET(request, context);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ beatId: string }> }
) {
  try {
    const { beatId } = await params;
    console.log(`🎵 Stream API [${request.method}] called for beatId:`, beatId);

    // 1. Fetch Beat
    const supabase = createServiceClient();
    console.log('🔍 Querying database...');
    
    const { data: beat, error } = await supabase
      .from('beats')
      .select('id, title, audio_url, preview_url')
      .eq('id', beatId)
      .single();

    console.log('📊 Database response:', { 
      beat: beat ? {
        id: beat.id,
        title: beat.title,
        audio_url: beat.audio_url?.substring(0, 80) + '...',
        preview_url: beat.preview_url?.substring(0, 80) + '...' || 'null'
      } : null,
      error 
    });

    if (error || !beat) {
      console.error('❌ Stream API: Beat not found or DB error', error, beatId);
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // 2. Extract Key
    let targetUrl = beat.preview_url || beat.audio_url;
    
    if (!targetUrl) {
      console.error('❌ Stream API: No audio source found for beat', beatId);
      return NextResponse.json({ error: 'No audio source found' }, { status: 404 });
    }

    // Normalize URL if it uses the S3 endpoint instead of public domain
    const accountId = process.env.R2_ACCOUNT_ID;
    const bucketName = process.env.R2_BUCKET_NAME;
    const publicUrl = process.env.R2_PUBLIC_URL;

    if (accountId && bucketName && publicUrl && targetUrl.includes('r2.cloudflarestorage.com')) {
      console.log('🔄 Normalizing S3 URL to public R2 URL');
      const s3Prefix = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/`;
      targetUrl = targetUrl.replace(s3Prefix, `${publicUrl}/`);
    }

    // Ensure URL is properly encoded (e.g., spaces in filenames)
    // We only encode the path part to avoid double-encoding the protocol/host
    const url = new URL(targetUrl);
    const decodedPath = decodeURI(url.pathname);
    const encodedUrl = `${url.origin}${encodeURI(decodedPath)}${url.search}`;

    console.log('🎯 Target URL:', encodedUrl);

    // 3. Proxy the audio to bypass CORS
    console.log('🔄 Proxying audio from:', encodedUrl);
    
    // Pass along Range header which is critical for WaveSurfer and seeking
    const range = request.headers.get('range');
    const proxyHeaders: HeadersInit = {
      'Cache-Control': 'no-cache',
    };
    if (range) {
      proxyHeaders['Range'] = range;
    }

    // Pass the same method (GET/HEAD)
    const response = await fetch(encodedUrl, {
      method: request.method,
      headers: proxyHeaders
    });

    if (!response.ok && response.status !== 206) {
      console.error(`❌ Stream API: Source responded with ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch audio from source: ${response.statusText}`);
    }

    // Create a new response with the streamed body
    const proxiedResponse = new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'audio/mpeg',
        'Content-Length': response.headers.get('Content-Length') || '',
        'Content-Range': response.headers.get('Content-Range') || '',
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    return proxiedResponse;

  } catch (error: any) {
    console.error('❌ Stream API: Internal Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
