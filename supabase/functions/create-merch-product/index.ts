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
    const { title, design_url, producer_id } = await req.json()

    // 1. Initialize Supabase
    const supabase = createClient(
      // @ts-ignore: Deno is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore: Deno is available in Supabase Edge Functions
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Mock Printful Call (Simulating the fulfillment provider)
    console.log(`[Edge Function] Creating Merch Product: ${title} for Producer: ${producer_id}`);
    
    // In a real scenario, we'd use the Printful API here
    const mockSupplierResponse = {
      external_id: 'pf_prod_' + Math.random().toString(36).substr(2, 9),
      variants: [
        { id: 'v1', price: 15.00 },
        { id: 'v2', price: 15.00 }
      ]
    }

    // 3. Save to Database
    const { data: product, error } = await supabase
      .from('merch_products')
      .insert({
        producer_id,
        name: title,
        source: 'printful',
        supplier_product_id: mockSupplierResponse.external_id,
        variant_ids: mockSupplierResponse.variants,
        base_cost: 15.00,
        price: 35.00,
        status: 'published'
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify(product), {
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
