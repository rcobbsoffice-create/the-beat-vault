import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Email provider configuration - supports Resend, SendGrid, and SMTP
const EMAIL_PROVIDER = Deno.env.get('EMAIL_PROVIDER') || 'resend' // 'resend' | 'sendgrid' | 'smtp'
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY') || ''
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@beatvault.com'
const FROM_NAME = Deno.env.get('FROM_NAME') || 'The Beat Vault'

interface EmailPayload {
  to: string | string[]
  subject: string
  html: string
  text?: string
  reply_to?: string
  tags?: string[]
}

async function sendWithResend(payload: EmailPayload) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(payload.to) ? payload.to : [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      reply_to: payload.reply_to,
      tags: payload.tags?.map(t => ({ name: t, value: 'true' })),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend error: ${error}`)
  }

  return await response.json()
}

async function sendWithSendGrid(payload: EmailPayload) {
  const toArray = Array.isArray(payload.to) ? payload.to : [payload.to]
  
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: toArray.map(email => ({ email })) }],
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: payload.subject,
      content: [
        { type: 'text/plain', value: payload.text || payload.html.replace(/<[^>]*>/g, '') },
        { type: 'text/html', value: payload.html },
      ],
      reply_to: payload.reply_to ? { email: payload.reply_to } : undefined,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`SendGrid error: ${error}`)
  }

  return { success: true, provider: 'sendgrid' }
}

async function sendEmail(payload: EmailPayload) {
  switch (EMAIL_PROVIDER) {
    case 'resend':
      return await sendWithResend(payload)
    case 'sendgrid':
      return await sendWithSendGrid(payload)
    default:
      throw new Error(`Unsupported email provider: ${EMAIL_PROVIDER}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { to, subject, html, text, template, template_data, newsletter_id } = await req.json()

    // If newsletter_id is provided, fetch newsletter data and recipients
    if (newsletter_id) {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Verify admin access
      const authHeader = req.headers.get('Authorization')
      if (authHeader) {
        const userClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? '',
          { global: { headers: { Authorization: authHeader } } }
        )
        const { data: { user } } = await userClient.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
          if (profile?.role !== 'admin') {
            throw new Error('Admin access required')
          }
        }
      }

      // Get newsletter
      const { data: newsletter, error: nlError } = await supabase
        .from('newsletters')
        .select('*')
        .eq('id', newsletter_id)
        .single()

      if (nlError || !newsletter) throw new Error('Newsletter not found')
      if (newsletter.status === 'sent') throw new Error('Newsletter already sent')

      // Get recipients based on audience
      let recipients: string[] = []

      if (newsletter.audience === 'all' || newsletter.audience === 'subscribers') {
        const { data: contacts } = await supabase
          .from('contacts')
          .select('email')
          .eq('subscribed', true)
        recipients = contacts?.map(c => c.email) || []
      } else if (newsletter.audience === 'producers') {
        const { data: producers } = await supabase
          .from('producers')
          .select('profiles!inner(email)')
          .eq('status', 'active')
        recipients = producers?.map((p: any) => p.profiles.email) || []
      } else if (newsletter.audience === 'artists') {
        const { data: artists } = await supabase
          .from('profiles')
          .select('email')
          .eq('role', 'artist')
        recipients = artists?.map(a => a.email) || []
      }

      // Send emails in batches of 50
      const batchSize = 50
      let sentCount = 0
      let errorCount = 0

      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize)
        try {
          await sendEmail({
            to: batch,
            subject: newsletter.subject,
            html: newsletter.html_content || newsletter.content,
            text: newsletter.content,
            tags: ['newsletter', newsletter.audience],
          })
          sentCount += batch.length
        } catch (e) {
          console.error('Batch send error:', e)
          errorCount += batch.length
        }
      }

      // Update newsletter status
      await supabase
        .from('newsletters')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          sent_count: sentCount,
        })
        .eq('id', newsletter_id)

      return new Response(
        JSON.stringify({ 
          success: true,
          sent_count: sentCount,
          error_count: errorCount,
          total_recipients: recipients.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Direct email sending
    if (!to || !subject || !html) {
      throw new Error('Missing required fields: to, subject, html')
    }

    const result = await sendEmail({ to, subject, html, text })

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Email error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})