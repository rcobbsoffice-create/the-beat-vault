import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { order_id } = await req.json()

    // 1. Initialize Supabase
    const supabase = createClient(
      // @ts-ignore: Deno environment
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno environment
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch Order Details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, merch_products(*)')
      .eq('id', order_id)
      .single()

    if (orderError || !order) throw new Error('Order not found')
    // @ts-ignore: order type inference
    if (order.payment_status !== 'paid') throw new Error('Order not paid')

    // 3. Mock Supplier Order Creation
    // @ts-ignore: order type inference
    console.log(`[Edge Function] Fulfilling Order: ${order_id} for Customer: ${order.customer_email}`);
    
    // In a real scenario, we'd use the Printful/Printify API here
    const mockFulfillment = {
      external_id: 'pf_ord_' + Math.random().toString(36).substr(2, 9),
      status: 'processing'
    }

    // 4. Update Order Status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        fulfillment_status: 'processing',
        payment_intent_id: mockFulfillment.external_id // Simplified for demo
      })
      .eq('id', order_id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, fulfillment_id: mockFulfillment.external_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
