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
    const { idea_id } = await req.json()

    // 1. Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Fetch Idea Details
    const { data: idea, error: fetchError } = await supabase
      .from('merch_ideas')
      .select('*')
      .eq('id', idea_id)
      .single()

    if (fetchError || !idea) throw new Error('Idea not found')

    // 3. Mark as Processing
    await supabase.from('merch_ideas').update({ status: 'processing' }).eq('id', idea_id)

    // 4. Simulate AI Mockup Generation
    console.log(`[Edge Function] Processing Merch Idea: ${idea_id}`);
    await new Promise(resolve => setTimeout(resolve, 3500));

    // 5. Update with AI Content
    const mockContent = {
      mockup_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000&auto=format&fit=crop',
      suggested_title: idea.content.raw_title || 'Signature Artist Tee',
      ai_reasoning: 'Minimalist vector design optimized for high-density screen printing.'
    }

    const { error: updateError } = await supabase
      .from('merch_ideas')
      .update({
        status: 'completed',
        content: { ...idea.content, ...mockContent }
      })
      .eq('id', idea_id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, mockup: mockContent.mockup_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
