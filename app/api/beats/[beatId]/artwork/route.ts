import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateDownloadUrl } from '@/lib/r2';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ beatId: string }> }
) {
  try {
    const { beatId } = await params;

    const supabase = createServiceClient();
    const { data: beat, error } = await supabase
      .from('beats')
      .select('artwork_url')
      .eq('id', beatId)
      .single();

    if (error || !beat || !beat.artwork_url) {
      return NextResponse.json({ error: 'Artwork not found' }, { status: 404 });
    }

    // Extract Key from URL
    const targetUrl = beat.artwork_url;
    const keyMatch = targetUrl.match(/(beats\/.*)/);
    const key = keyMatch ? keyMatch[1] : null;

    if (!key) {
      console.error('Could not extract R2 key from URL:', targetUrl);
      return NextResponse.json({ error: 'Invalid storage URL format' }, { status: 500 });
    }

    // Generate Signed URL
    const signedUrl = await generateDownloadUrl(key);

    // Redirect
    return NextResponse.redirect(signedUrl);

  } catch (error: any) {
    console.error('Artwork Stream Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
