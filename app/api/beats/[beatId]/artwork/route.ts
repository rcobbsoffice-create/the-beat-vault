import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// Force dynamic rendering - no caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // Extract URL from database and redirect directly
    const targetUrl = beat.artwork_url;
    
    if (!targetUrl) {
      console.error('Artwork URL not found for beat:', beatId);
      return NextResponse.json({ error: 'Invalid storage URL format' }, { status: 500 });
    }

    console.log('Artwork API: Redirecting to public URL:', targetUrl);
    
    // Redirect directly to the public R2 URL
    const response = NextResponse.redirect(targetUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error: any) {
    console.error('Artwork Stream Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
