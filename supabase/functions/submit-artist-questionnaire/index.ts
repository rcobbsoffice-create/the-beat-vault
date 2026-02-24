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

    const { responses } = await req.json()

    if (!responses || typeof responses !== 'object') {
      throw new Error('responses object is required')
    }

    // Create or update questionnaire
    const { data, error } = await supabaseClient
      .from('artist_questionnaires')
      .upsert({
        artist_id: user.id,
        responses,
        status: 'pending',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'artist_id' })
      .select()
      .single()

    if (error) throw error

    // TODO: Trigger AI content generation
    // This would integrate with OpenAI or similar to generate
    // artist bios, press releases, etc. based on questionnaire responses

    return new Response(
      JSON.stringify({ 
        success: true,
        questionnaire: data,
        message: 'Questionnaire submitted successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Submit questionnaire error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})