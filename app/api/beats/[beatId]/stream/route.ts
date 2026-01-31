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
    console.log('🎵 Stream API called for beatId:', beatId);

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
    const targetUrl = beat.preview_url || beat.audio_url;
    console.log('🎯 Target URL:', targetUrl);
    console.log('🌐 URL domain:', targetUrl?.split('/').slice(0, 3).join('/'));
    
    if (!targetUrl) {
      console.error('❌ Stream API: No audio source found for beat', beatId);
      return NextResponse.json({ error: 'No audio source found' }, { status: 404 });
    }

    // Since files are now public on R2.dev, redirect directly to the stored URL
    console.log('✅ Redirecting to:', targetUrl);
    
    // Create response with cache control headers
    const response = NextResponse.redirect(targetUrl);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;

  } catch (error: any) {
    console.error('❌ Stream API: Internal Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
