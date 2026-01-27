import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// CORS headers for local/frontend access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { beat_id } = await req.json()
    if (!beat_id) throw new Error('Missing beat_id')

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch Beat metadata
    const { data: beat, error: fetchError } = await supabase
      .from('beats')
      .select('*')
      .eq('id', beat_id)
      .single()

    if (fetchError || !beat) throw new Error(`Beat not found: ${fetchError?.message}`)

    console.log(`[Edge Function] Analyzing beat: ${beat.title} (${beat_id})`)

    // 3. Audio Analysis logic (to be implemented with WASM/JS libs)
    // For now, we simulate extraction based on metadata
    // In a real implementation, we would download beat.audio_url and process.

    const bpm = beat.bpm || 140
    // Generate simulated pulse data for demonstration
    // pulse strength based on a rhythmic pattern (8th notes)
    const duration = 30 // analyze first 30 seconds
    const fps = 30
    const totalFrames = duration * fps
    const beatInterval = (60 / bpm) * fps
    
    const pulseStrength = Array.from({ length: totalFrames }, (_, i) => {
      const frameInBeat = i % beatInterval
      // Simple pulse decay
      return Math.max(0, 1 - (frameInBeat / (beatInterval / 2)))
    })

    const bassEnergy = Array.from({ length: totalFrames }, (_, i) => {
      // 808s usually hit on 1 and 3 in many trap beats
      const beatNum = Math.floor(i / beatInterval)
      const isBassHit = beatNum % 4 === 0 || beatNum % 4 === 2
      return isBassHit ? pulseStrength[i] * 1.2 : pulseStrength[i] * 0.5
    })

    // 4. Save to pulse_data
    const { error: insertError } = await supabase
      .from('pulse_data')
      .upsert({
        beat_id,
        bpm,
        bass_energy: bassEnergy,
        rms_loudness: pulseStrength,
        pulses: { frames: pulseStrength },
        updated_at: new Date().toISOString()
      }, { onConflict: 'beat_id' })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ 
      success: true, 
      beat_id, 
      bpm,
      message: 'Pulse data generated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error(`[Edge Function Error]: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
