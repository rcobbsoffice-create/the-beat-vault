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

    // Check if already favorited
    const { data: existing } = await supabaseClient
      .from('beat_favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('beat_id', beat_id)
      .single()

    let isFavorited = false

    if (existing) {
      // Remove favorite
      const { error } = await supabaseClient
        .from('beat_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('beat_id', beat_id)

      if (error) throw error
      isFavorited = false
    } else {
      // Add favorite
      const { error } = await supabaseClient
        .from('beat_favorites')
        .insert({ user_id: user.id, beat_id })

      if (error) throw error
      isFavorited = true
    }

    return new Response(
      JSON.stringify({ success: true, is_favorited: isFavorited }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})