import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { createPaymentIntent } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    const body = await request.json();
    const { beatId, licenseId } = body;

    if (!beatId || !licenseId) {
      return NextResponse.json(
        { error: 'Beat ID and License ID are required' },
        { status: 400 }
      );
    }

    // Get authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get beat with license and producer
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .select(`
        *,
        producer:profiles!beats_producer_id_fkey(*),
        licenses(*)
      `)
      .eq('id', beatId)
      .single();

    if (beatError || !beat) {
      return NextResponse.json({ error: 'Beat not found' }, { status: 404 });
    }

    // Cast beat to any to handle joined relations that aren't in the default type
    const beatData = beat as any;

    const license = beatData.licenses?.find((l: any) => l.id === licenseId);
    if (!license || !license.is_active) {
      return NextResponse.json({ error: 'License not found or inactive' }, { status: 404 });
    }

    // Check producer has Stripe Connect
    if (!beatData.producer?.stripe_connect_account_id) {
      return NextResponse.json(
        { error: 'Producer has not set up payments' },
        { status: 400 }
      );
    }
    
    // Calculate platform fee (15% default)
    const platformFeePercent = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '15');
    const platformFee = Math.round(license.price * (platformFeePercent / 100));

    // Create payment intent with application fee
    const paymentIntent = await createPaymentIntent(
      license.price,
      beatData.producer.stripe_connect_account_id,
      platformFee,
      {
        beat_id: beatId,
        producer_id: beatData.producer_id,
        license_id: licenseId,
        buyer_id: user.id,
        license_type: license.type,
      }
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: license.price,
      platformFee,
      producerPayout: license.price - platformFee,
    });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
