// @ts-nocheck
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
    const { profile_id, role, display_name } = await req.json()

    if (!profile_id || !role) {
      throw new Error('Missing profile_id or role')
    }

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Mock Printful Call (Simulating store creation)
    console.log(`[Edge Function] Creating Printful Store for ${role}: ${display_name} (${profile_id})`);
    
    // In a real scenario, we'd use the Printful API here:
    // POST https://api.printful.com/stores
    const mockStoreId = Math.floor(Math.random() * 10000000).toString();

    // 3. Update Database based on role
    let updateError;
    if (role === 'producer') {
      const { error } = await supabase
        .from('producers')
        .update({ printful_store_id: mockStoreId })
        .eq('profile_id', profile_id);
      updateError = error;
    } else if (role === 'artist') {
      const { error } = await supabase
        .from('artists')
        .update({ printful_store_id: mockStoreId })
        .eq('profile_id', profile_id);
      updateError = error;
    }

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ 
      success: true, 
      store_id: mockStoreId,
      message: `Printful store created for ${role}`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Error in create-printful-store:', error.message);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
