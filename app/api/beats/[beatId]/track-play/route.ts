import { createServiceClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ beatId: string }> }
) {
  try {
    const { beatId } = await params;
    console.log('📈 Track Play called for beatId:', beatId);
    
    const supabase = createServiceClient();
    console.log('🔍 Executing RPC increment_play_count...');
    
    const { error } = await supabase.rpc('increment_play_count', { beat_id: beatId });

    if (error) {
      console.error('❌ Track Play Error:', error);
      return NextResponse.json({ 
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      }, { status: 500 });
    }

    console.log('✅ Track Play successful');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Track Play Exception:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
