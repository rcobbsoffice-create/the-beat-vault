import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

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

    const { store_slug, return_url, refresh_url } = await req.json()

    if (!store_slug) {
      throw new Error('store_slug is required')
    }

    // Check if producer profile already exists
    const { data: existing } = await supabaseClient
      .from('producers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (existing) {
      throw new Error('Producer profile already exists')
    }

    // Create Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      metadata: {
        user_id: user.id,
        store_slug,
      },
    })

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      return_url: return_url || `${Deno.env.get('EXPO_PUBLIC_APP_URL')}/dashboard/producer/storefront`,
      refresh_url: refresh_url || `${Deno.env.get('EXPO_PUBLIC_APP_URL')}/dashboard/producer/storefront`,
      type: 'account_onboarding',
    })

    // Create producer profile
    const { data: producer, error: createError } = await supabaseClient
      .from('producers')
      .insert({
        profile_id: user.id,
        store_slug,
        stripe_account_id: account.id,
        status: 'pending',
      })
      .select()
      .single()

    if (createError) throw createError

    // Create default store settings
    await supabaseClient
      .from('stores')
      .insert({
        producer_id: producer.id,
      })

    return new Response(
      JSON.stringify({ 
        success: true,
        producer,
        onboarding_url: accountLink.url
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Create producer error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})