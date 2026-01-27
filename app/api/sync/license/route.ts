import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { generateLicenseMarkdown } from '@/lib/licenses';

/**
 * Public API for Sync Licensing
 * POST /api/sync/license
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { beatId, partnerId, artistName, purpose } = body;

    // 1. Verify API Key / Partner (Simple check for now)
    if (!partnerId) {
      return NextResponse.json({ error: 'Valid Partner Identification required' }, { status: 401 });
    }

    // 2. Resolve Beat & Producer
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .select(`
        *,
        producer:profiles!beats_producer_id_fkey(*)
      `)
      .eq('id', beatId)
      .eq('is_sync_ready', true)
      .single();

    if (beatError || !beat) {
      return NextResponse.json({ error: 'Track not found or not available for Sync' }, { status: 404 });
    }

    const beatData = beat as any;

    // 3. Generate Programmatic Sync License
    const licenseMarkdown = generateLicenseMarkdown({
      beatTitle: beatData.title,
      producerName: beatData.producer?.display_name || 'AudioGenes Producer',
      artistName: artistName || 'Consuming Partner Artist',
      licenseType: 'sync',
      price: 49900, // Default sync price in cents
      date: new Date(),
      isrc: beatData.isrc,
      upc: beatData.upc,
      label: beatData.label,
      publisher: beatData.publisher,
    });

    // 4. Record Transaction (Mocking the sale for now)
    const { data: transaction, error: txError } = await (supabase
      .from('purchases') as any)
      .insert({
        beat_id: beatId,
        buyer_id: '00000000-0000-0000-0000-000000000000', // System Partner ID
        license_id: '00000000-0000-0000-0000-000000000000', // Sync License Template ID
        stripe_payment_intent_id: `PROGRAMMATIC_SYNC_${Date.now()}`,
        amount_paid: 49900,
        platform_fee: 7485, // 15%
        producer_payout: 42415,
        status: 'completed',
        license_agreement_markdown: licenseMarkdown,
        metadata: {
          partner_id: partnerId,
          purpose: purpose || 'System Integration'
        }
      })
      .select()
      .single();

    if (txError) throw txError;

    return NextResponse.json({
      success: true,
      licenseId: transaction.id,
      agreement: licenseMarkdown,
      status: 'Live',
      metadata: {
        isrc: beatData.isrc,
        upc: beatData.upc
      }
    });

  } catch (error: any) {
    console.error('Public Sync API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
