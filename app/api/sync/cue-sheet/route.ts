import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

/**
 * Dynamic Cue Sheet Generator API
 * GET /api/sync/cue-sheet?purchaseId=...
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const purchaseId = searchParams.get('purchaseId');

    if (!purchaseId) {
      return NextResponse.json({ error: 'Purchase ID required' }, { status: 400 });
    }

    // Resolve purchase and associated beat/producer data
    const { data: purchase, error } = await supabase
      .from('purchases')
      .select(`
        *,
        beat:beats (
          *,
          producer:profiles!beats_producer_id_fkey(*)
        ),
        license:licenses (*)
      `)
      .eq('id', purchaseId)
      .single();

    if (error || !purchase) {
      return NextResponse.json({ error: 'License record not found' }, { status: 404 });
    }

    const p = purchase as any;
    const beat = p.beat;
    const producer = beat.producer;

    // Generate Industry Standard Cue Sheet Data
    const cueSheet = {
      workTitle: beat.title,
      isrc: beat.isrc,
      upc: beat.upc,
      format: 'Feature / Program',
      usage: 'Background Vocal / Instrumental',
      parties: [
        {
          role: 'Composer / Producer',
          name: producer.display_name,
          performanceRightsOrganization: 'ASCAP / BMI / SESAC',
          share: '50%'
        },
        {
          role: 'Artist / Performer',
          name: p.buyer?.display_name || 'Licensed Artist',
          share: '50%'
        }
      ],
      publisher: beat.publisher || 'The Beat Vault Publishing',
      label: beat.label || 'The Beat Vault Independent',
      licenseId: p.id,
      dateGenerated: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      cueSheet
    });

  } catch (error: any) {
    console.error('Cue Sheet API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
