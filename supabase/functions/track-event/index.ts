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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_type, beat_id, user_id, metadata, session_id } = await req.json()

    if (!event_type) {
      throw new Error('event_type is required')
    }

    // Get IP and user agent from request
    const ip_address = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
    const user_agent = req.headers.get('user-agent')

    // Insert analytics event
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        user_id,
        beat_id,
        metadata: metadata || {},
        session_id,
        ip_address,
        user_agent,
      })

    if (error) throw error

    // Handle specific event types
    switch (event_type) {
      case 'beat_play':
        if (beat_id) {
          await supabase.rpc('increment_play_count', { beat_id })
        }
        break
      case 'beat_view':
        if (beat_id) {
          await supabase.rpc('increment_view_count', { beat_id })
        }
        break
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Track event error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})