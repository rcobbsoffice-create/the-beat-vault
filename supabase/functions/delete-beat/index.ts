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

    const { beat_id } = await req.json()

    if (!beat_id) {
      throw new Error('beat_id is required')
    }

    // Verify ownership
    const { data: beat, error: fetchError } = await supabaseClient
      .from('beats')
      .select('producer_id, audio_url, artwork_url')
      .eq('id', beat_id)
      .single()

    if (fetchError || !beat) {
      throw new Error('Beat not found')
    }

    if (beat.producer_id !== user.id) {
      throw new Error('Unauthorized - not the beat owner')
    }

    // TODO: Delete files from R2 storage
    // This would require implementing R2 deletion in Edge Functions
    // For now, we'll just soft delete by setting status to 'archived'

    const { error } = await supabaseClient
      .from('beats')
      .update({ status: 'archived', updated_at: new Date().toISOString() })
      .eq('id', beat_id)

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, message: 'Beat archived successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})