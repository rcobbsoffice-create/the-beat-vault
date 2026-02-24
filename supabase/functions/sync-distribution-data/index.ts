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

    const { artist_id, asset_id, dsp_data } = await req.json()

    if (!artist_id || !dsp_data) {
      throw new Error('artist_id and dsp_data are required')
    }

    // dsp_data should be an array of:
    // {
    //   dsp: 'spotify' | 'apple_music' | 'youtube' | etc.
    //   stream_count: number,
    //   revenue_usd: number,
    //   country_code?: string,
    //   period_start: date,
    //   period_end: date
    // }

    const records = dsp_data.map((item: any) => ({
      artist_id,
      asset_id,
      dsp: item.dsp,
      stream_count: item.stream_count || 0,
      revenue_usd: item.revenue_usd || 0,
      country_code: item.country_code,
      period_start: item.period_start,
      period_end: item.period_end,
    }))

    // Insert distribution data
    const { error } = await supabase
      .from('distribution_data')
      .upsert(records)

    if (error) throw error

    return new Response(
      JSON.stringify({ 
        success: true,
        records_synced: records.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Sync distribution data error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})