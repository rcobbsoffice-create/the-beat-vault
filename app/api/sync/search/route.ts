import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);

    const genre = searchParams.get('genre');
    const mood = searchParams.get('mood');
    const bpmMin = searchParams.get('bpmMin');
    const bpmMax = searchParams.get('bpmMax');
    const key = searchParams.get('key');
    const query = searchParams.get('q');

    let dbQuery = supabase
      .from('beats')
      .select(`
        *,
        producer:profiles!beats_producer_id_fkey(id, display_name, avatar_url)
      `)
      .eq('is_sync_ready', true)
      .eq('status', 'published');

    if (genre) dbQuery = dbQuery.eq('genre', genre);
    if (key) dbQuery = dbQuery.eq('key', key);
    if (bpmMin) dbQuery = dbQuery.gte('bpm', parseInt(bpmMin));
    if (bpmMax) dbQuery = dbQuery.lte('bpm', parseInt(bpmMax));
    
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    if (mood) {
      // Assuming moods are stored in a JSONB or array field
      dbQuery = dbQuery.contains('metadata->moods', [mood]);
    }

    const { data, error } = await dbQuery.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      count: data.length,
      results: data
    });
  } catch (error: any) {
    console.error('Sync Search Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
