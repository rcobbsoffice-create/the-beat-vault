import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature')

  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Stripe webhook event:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { beat_id, license_type, producer_id } = paymentIntent.metadata

        // Update purchase status
        const { error: updateError } = await supabase
          .from('purchases')
          .update({
            status: 'completed',
            charge_id: paymentIntent.latest_charge as string,
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', paymentIntent.id)

        if (updateError) {
          console.error('Error updating purchase:', updateError)
        }

        // Increment purchase count on beat
        await supabase.rpc('increment_purchase_count', { beat_id_param: beat_id })

        // TODO: Generate and store download links
        // TODO: Send confirmation email

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await supabase
          .from('purchases')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('payment_intent_id', paymentIntent.id)

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        await supabase
          .from('purchases')
          .update({
            status: 'refunded',
            updated_at: new Date().toISOString(),
          })
          .eq('charge_id', charge.id)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Webhook error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400 }
    )
  }
})