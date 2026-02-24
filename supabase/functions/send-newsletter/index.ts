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

    // Get user and verify admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || profile.role !== 'admin') {
      throw new Error('Admin access required')
    }

    const { newsletter_id } = await req.json()

    if (!newsletter_id) {
      throw new Error('newsletter_id is required')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get newsletter
    const { data: newsletter, error: nlError } = await supabase
      .from('newsletters')
      .select('*')
      .eq('id', newsletter_id)
      .single()

    if (nlError || !newsletter) throw new Error('Newsletter not found')

    if (newsletter.status === 'sent') {
      throw new Error('Newsletter already sent')
    }

    // Get contacts based on audience
    let query = supabase.from('contacts').select('email, name').eq('subscribed', true)

    if (newsletter.audience === 'producers') {
      // Get producer emails
      const { data: producers } = await supabase
        .from('producers')
        .select('profiles!inner(email)')
        .eq('status', 'active')
      
      // TODO: Implement proper email sending logic
    } else if (newsletter.audience === 'artists') {
      // Similar logic for artists
    } else {
      // Send to all contacts
      const { data: contacts } = await query
      
      // TODO: Integrate with email service (SendGrid, Mailgun, etc.)
      // For now, just update the newsletter status
    }

    // Update newsletter status
    const { error: updateError } = await supabase
      .from('newsletters')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        sent_count: 0, // TODO: Update with actual count
      })
      .eq('id', newsletter_id)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Newsletter sending initiated (email integration pending)'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Send newsletter error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})