import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createServiceClient } from '@/lib/supabase';
import { generateDownloadUrl, getBeatFilePaths } from '@/lib/r2';
import { generateLicenseMarkdown } from '@/lib/licenses';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const supabase = createServiceClient();

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        if (!metadata.beat_id || !metadata.license_id || !metadata.buyer_id) {
          console.error('Missing metadata in payment intent');
          break;
        }

        // Fetch beat and license details
        const { data: beat } = await supabase
          .from('beats')
          .select('*')
          .eq('id', metadata.beat_id)
          .single();

        const { data: license } = await supabase
          .from('licenses')
          .select('*')
          .eq('id', metadata.license_id)
          .single();

        if (!beat || !license) {
          console.error('Beat or license not found in webhook');
          break;
        }

        const beatData = beat as any;
        const licenseData = license as any;

        // Get beat file paths
        const filePaths = getBeatFilePaths(metadata.beat_id);
        
        // Generate download URLs
        const downloadUrls: Record<string, any> = {};
        
        if (licenseData.files_included?.includes('mp3')) {
          downloadUrls.mp3 = await generateDownloadUrl(filePaths.preview);
        }
        if (licenseData.files_included?.includes('wav')) {
          downloadUrls.wav = await generateDownloadUrl(filePaths.original);
        }
        if (licenseData.files_included?.includes('stems')) {
          downloadUrls.stems = {
            drums: await generateDownloadUrl(filePaths.stems.drums),
            melody: await generateDownloadUrl(filePaths.stems.melody),
            bass: await generateDownloadUrl(filePaths.stems.bass),
          };
        }

        // Calculate amounts (from application_fee_amount)
        const applicationFee = paymentIntent.application_fee_amount || 0;
        const producerPayout = paymentIntent.amount - applicationFee;

        // Generate License Markdown
        const { data: producer } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', metadata.producer_id)
          .single();
          
        const { data: buyer } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('id', metadata.buyer_id)
          .single();

        const licenseMarkdown = generateLicenseMarkdown({
          beatTitle: beatData.title,
          producerName: (producer as any)?.display_name || 'Producer',
          artistName: (buyer as any)?.display_name || 'Artist',
          licenseType: metadata.license_type as any,
          price: paymentIntent.amount,
          date: new Date(),
          isrc: beatData.isrc,
          upc: beatData.upc,
          label: beatData.label,
          publisher: beatData.publisher,
        });

        // Create purchase record
        const { error: purchaseError } = await (supabase
          .from('purchases') as any)
          .insert({
            buyer_id: metadata.buyer_id,
            beat_id: metadata.beat_id,
            license_id: metadata.license_id,
            stripe_payment_intent_id: paymentIntent.id,
            amount_paid: paymentIntent.amount,
            platform_fee: applicationFee,
            producer_payout: producerPayout,
            status: 'completed',
            download_urls: downloadUrls,
            license_agreement_markdown: licenseMarkdown,
            download_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
          });

        if (purchaseError) {
          console.error('Failed to create purchase:', purchaseError);
        }

        // Log analytics event
        await (supabase
          .from('analytics_events') as any)
          .insert({
            event_type: 'purchase',
            user_id: metadata.buyer_id,
            beat_id: metadata.beat_id,
            metadata: {
              license_type: metadata.license_type,
              amount: paymentIntent.amount,
            },
          });

        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        console.log('Payment failed for:', metadata);
        // Could send email notification to user
        break;
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        const userId = account.metadata?.user_id;

        if (userId && account.details_submitted && account.charges_enabled) {
          await (supabase
            .from('profiles') as any)
            .update({ stripe_onboarding_complete: true })
            .eq('id', userId);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
