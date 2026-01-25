import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * AI Training Data Export API
 * GET /api/ai/training-data?limit=1000
 * Structured for direct ingestion into ML pipelines or LLM finetuning.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '1000');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Fetch enriched event data from the AI view
    const { data, error } = await supabase
      .from('ai_training_events' as any)
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transform for AI readiness (e.g., flattening JSONB or converting to specific format)
    const aiReadyData = data.map((event: any) => ({
      id: event.id,
      timestamp: event.created_at,
      action: event.event_type,
      context: {
        beatId: event.beat_id,
        userId: event.user_id,
        sessionId: event.session_id,
        metadata: {
          genre: event.genre,
          bpm: event.bpm,
          key: event.key,
          moods: event.mood_tags
        }
      },
      metrics: event.event_data,
      label: event.event_type === 'purchase' ? 1 : 0 // Simple label for conversion models
    }));

    return NextResponse.json({
      count: aiReadyData.length,
      next_offset: offset + limit,
      data: aiReadyData,
      schema_version: '1.0.0-ai-alpha'
    });

  } catch (error: any) {
    console.error('AI Training Data Export Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
