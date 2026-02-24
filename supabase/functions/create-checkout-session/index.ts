import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { beat_id, license_type, buyer_email, success_url, cancel_url } = await req.json()

    if (!beat_id || !license_type || !buyer_email) {
      throw new Error('Missing required fields')
    }

    // Fetch beat and license details
    const { data: beat, error: beatError } = await supabase
      .from('beats')
      .select('*, producer:profiles!producer_id(*)')
      .eq('id', beat_id)
      .single()

    if (beatError || !beat) throw new Error('Beat not found')

    const { data: license, error: licenseError } = await supabase
      .from('licenses')
      .select('*')
      .eq('beat_id', beat_id)
      .eq('type', license_type)
      .single()

    if (licenseError || !license) throw new Error('License not found')

    // Get producer's Stripe account
    const { data: producer, error: producerError } = await supabase
      .from('producers')
      .select('stripe_account_id')
      .eq('profile_id', beat.producer_id)
      .single()

    if (producerError || !producer?.stripe_account_id) {
      throw new Error('Producer payment setup incomplete')
    }

    // Calculate platform fee (15% default)
    const platformFeePercentage = parseInt(Deno.env.get('PLATFORM_FEE_PERCENTAGE') || '15')
    const platformFee = Math.round(license.price * (platformFeePercentage / 100))
    const producerAmount = license.price - platformFee

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${beat.title} - ${license_type} License`,
              description: `${license.files_included?.join(', ')}`,
              images: beat.artwork_url ? [beat.artwork_url] : [],
            },
            unit_amount: license.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: success_url || `${Deno.env.get('EXPO_PUBLIC_APP_URL')}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${Deno.env.get('EXPO_PUBLIC_APP_URL')}/beats/${beat_id}`,
      customer_email: buyer_email,
      payment_intent_data: {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: producer.stripe_account_id,
        },
        metadata: {
          beat_id,
          license_type,
          producer_id: beat.producer_id,
        },
      },
      metadata: {
        beat_id,
        license_id: license.id,
        license_type,
        producer_id: beat.producer_id,
        buyer_email,
      },
    })

    // Create pending purchase record
    await supabase.from('purchases').insert({
      beat_id,
      license_id: license.id,
      producer_id: beat.producer_id,
      buyer_email,
      amount_total: license.price,
      amount_producer: producerAmount,
      amount_platform: platformFee,
      payment_intent_id: session.payment_intent as string,
      status: 'pending',
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        session_id: session.id,
        url: session.url 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Checkout error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})