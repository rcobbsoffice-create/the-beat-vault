import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { beat_id, updates } = await req.json()

    if (!beat_id) {
      throw new Error('beat_id is required')
    }

    // Verify ownership
    const { data: beat, error: fetchError } = await supabaseClient
      .from('beats')
      .select('producer_id')
      .eq('id', beat_id)
      .single()

    if (fetchError || !beat) {
      throw new Error('Beat not found')
    }

    if (beat.producer_id !== user.id) {
      throw new Error('Unauthorized - not the beat owner')
    }

    // Update beat
    const { data, error } = await supabaseClient
      .from('beats')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', beat_id)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, beat: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})