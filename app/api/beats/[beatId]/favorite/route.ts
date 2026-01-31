import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ beatId: string }> }
) {
  try {
    const { beatId } = await params;
    console.log('⭐ Toggle Favorite called for beatId:', beatId);
    
    const supabase = createServiceClient();
    
    // Call the toggle_favorite RPC
    const { data, error } = await supabase.rpc('toggle_favorite', { beat_id: beatId });

    if (error) {
      console.error('❌ Toggle Favorite Error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Toggle Favorite successful:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('❌ Toggle Favorite Exception:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
