import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { deleteFromR2 } from '@/lib/r2';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ beatId: string }> }
) {
  try {
    const { beatId } = await params;
    
    // Auth Check
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('Delete error: No authorization header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const supabase = createServiceClient();
    const token = authHeader.replace('Bearer ', '');
    
    if (!token || token === 'undefined') {
      console.error('Delete error: Invalid or missing token in header');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Delete error: Auth verification failed', authError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Delete request for beat:', beatId, 'by user:', user.id);

    // 1. Fetch Beat to get file paths (and verify ownership)
    const { data: beat, error: fetchError } = await supabase
      .from('beats')
      .select('*')
      .eq('id', beatId)
      .eq('producer_id', user.id) // Ensure user owns the beat
      .single();

    if (fetchError || !beat) {
      return NextResponse.json({ error: 'Beat not found or unauthorized' }, { status: 404 });
    }

    // 2. Delete files from R2
    const filesToDelete: string[] = [];
    
    const extractKey = (url: string | null) => {
      if (!url) return null;
      const match = url.match(/(beats\/.*)/);
      return match ? match[1] : null;
    };

    if (beat.audio_url) {
      const key = extractKey(beat.audio_url);
      if (key) filesToDelete.push(key);
    }
    
    if (beat.artwork_url) {
       const key = extractKey(beat.artwork_url);
       if (key) filesToDelete.push(key);
    }
    
    // Delete validation is lenient: try to delete, log errors but don't block DB delete
    await Promise.allSettled(filesToDelete.map(key => deleteFromR2(key)));

    // 3. Delete from Supabase
    console.log('Attempting to delete beat from DB:', beatId);
    const { error: deleteError } = await supabase
      .from('beats')
      .delete()
      .eq('id', beatId);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      throw deleteError;
    }

    console.log('Successfully deleted beat:', beatId);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Delete Beat Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
