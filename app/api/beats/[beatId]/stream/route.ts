import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateDownloadUrl } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ beatId: string }> }
) {
  try {
    const { beatId } = await params;

    // 1. Fetch Beat
    const supabase = createServiceClient();
    const { data: beat, error } = await supabase
      .from('beats')
      .select('audio_url, preview_url')
      .eq('id', beatId)
      .single();

    if (error || !beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // 2. Extract Key
    // URL format expected: https://<account>.r2.cloudflarestorage.com/<bucket>/beats/...
    // We need to extract: beats/...
    // We look for the "beats/" pattern in the URL.
    const targetUrl = beat.preview_url || beat.audio_url;
    
    if (!targetUrl) {
      return NextResponse.json({ error: 'No audio source found' }, { status: 404 });
    }

    const keyMatch = targetUrl.match(/(beats\/.*)/);
    const key = keyMatch ? keyMatch[1] : null;

    if (!key) {
      console.error('Could not extract R2 key from URL:', targetUrl);
      return NextResponse.json({ error: 'Invalid storage URL format' }, { status: 500 });
    }

    // 3. Generate Signed URL (valid for 1 hour)
    const signedUrl = await generateDownloadUrl(key);

    // 4. Redirect to the signed URL
    return NextResponse.redirect(signedUrl);

  } catch (error: any) {
    console.error('Stream Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
