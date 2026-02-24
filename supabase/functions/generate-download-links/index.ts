import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { S3Client, GetObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.445.0"
import { getSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.445.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// R2 Configuration
const R2_ENDPOINT = Deno.env.get('R2_ENDPOINT') || ''
const R2_ACCESS_KEY = Deno.env.get('R2_ACCESS_KEY_ID') || ''
const R2_SECRET_KEY = Deno.env.get('R2_SECRET_ACCESS_KEY') || ''
const R2_BUCKET = Deno.env.get('R2_BUCKET_NAME') || 'beatvault'
const R2_PUBLIC_URL = Deno.env.get('R2_PUBLIC_URL') || ''

// Initialize R2 client
const r2Client = R2_ACCESS_KEY && R2_SECRET_KEY ? new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
  forcePathStyle: true,
}) : null

interface DownloadLinks {
  mp3?: string
  wav?: string
  stems?: string
  contract?: string
  expires_at: string
}

// Generate signed URL for a file
async function generateSignedUrl(key: string, expiresIn = 86400): Promise<string> {
  if (!r2Client) {
    throw new Error('R2 client not configured')
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

// Generate secure download token
function generateDownloadToken(purchaseId: string, beatId: string): string {
  const data = `${purchaseId}:${beatId}:${Date.now()}`
  // Simple hash - in production use proper crypto
  let hash = 0
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash).toString(36) + Date.now().toString(36)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { purchase_id, download_token, action } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ACTION: Generate download links for a purchase (called after successful payment)
    if (action === 'generate') {
      if (!purchase_id) throw new Error('purchase_id required')

      // Get purchase details
      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('*, beat:beats(*), license:licenses(*)')
        .eq('id', purchase_id)
        .single()

      if (purchaseError || !purchase) {
        throw new Error('Purchase not found')
      }

      if (purchase.status !== 'completed') {
        throw new Error('Purchase not completed')
      }

      const beat = purchase.beat
      const license = purchase.license
      const filesIncluded = license?.files_included || ['MP3']

      const links: DownloadLinks = {
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      }

      // Generate download links based on license type
      if (filesIncluded.includes('MP3') && beat.preview_url) {
        const key = beat.preview_url.replace(R2_PUBLIC_URL + '/', '')
        links.mp3 = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      if (filesIncluded.includes('WAV') && beat.audio_url) {
        const key = beat.audio_url.replace(R2_PUBLIC_URL + '/', '')
        links.wav = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      if (filesIncluded.includes('Stems') && beat.stems_url) {
        const key = beat.stems_url.replace(R2_PUBLIC_URL + '/', '')
        links.stems = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      // Generate contract if available
      if (license?.contract_file_url) {
        const key = license.contract_file_url.replace(R2_PUBLIC_URL + '/', '')
        links.contract = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      // Generate download token
      const token = generateDownloadToken(purchase_id, beat.id)

      // Update purchase with download info
      const { error: updateError } = await supabase
        .from('purchases')
        .update({
          download_urls: links,
          downloads_remaining: 3,
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchase_id)

      if (updateError) throw updateError

      // Store download token
      await supabase
        .from('download_tokens')
        .insert({
          purchase_id,
          token,
          expires_at: links.expires_at,
        })

      return new Response(
        JSON.stringify({
          success: true,
          download_token: token,
          links,
          downloads_remaining: 3,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Validate token and get download links
    if (action === 'get_links') {
      if (!download_token) throw new Error('download_token required')

      // Find token
      const { data: tokenData, error: tokenError } = await supabase
        .from('download_tokens')
        .select('*, purchase:purchases(*)')
        .eq('token', download_token)
        .single()

      if (tokenError || !tokenData) {
        throw new Error('Invalid download token')
      }

      // Check expiration
      if (new Date(tokenData.expires_at) < new Date()) {
        throw new Error('Download link expired')
      }

      // Check download limit
      if (tokenData.purchase.downloads_remaining <= 0) {
        throw new Error('Download limit reached')
      }

      return new Response(
        JSON.stringify({
          success: true,
          links: tokenData.purchase.download_urls,
          downloads_remaining: tokenData.purchase.downloads_remaining,
          expires_at: tokenData.expires_at,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Record download and decrement counter
    if (action === 'record_download') {
      if (!purchase_id) throw new Error('purchase_id required')

      const { error } = await supabase.rpc('decrement_download_count', {
        purchase_id_param: purchase_id,
      })

      if (error) {
        console.error('Failed to decrement download count:', error)
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Regenerate expired links (for verified purchase owner)
    if (action === 'regenerate') {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        {
          global: {
            headers: { Authorization: req.headers.get('Authorization')! },
          },
        }
      )

      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) throw new Error('Unauthorized')

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .select('*, beat:beats(*), license:licenses(*)')
        .eq('id', purchase_id)
        .eq('buyer_id', user.id)
        .single()

      if (purchaseError || !purchase) {
        throw new Error('Purchase not found or unauthorized')
      }

      // Generate fresh links (same logic as 'generate')
      const beat = purchase.beat
      const license = purchase.license
      const filesIncluded = license?.files_included || ['MP3']

      const links: DownloadLinks = {
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }

      if (filesIncluded.includes('MP3') && beat.preview_url) {
        const key = beat.preview_url.replace(R2_PUBLIC_URL + '/', '')
        links.mp3 = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      if (filesIncluded.includes('WAV') && beat.audio_url) {
        const key = beat.audio_url.replace(R2_PUBLIC_URL + '/', '')
        links.wav = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      if (filesIncluded.includes('Stems') && beat.stems_url) {
        const key = beat.stems_url.replace(R2_PUBLIC_URL + '/', '')
        links.stems = await generateSignedUrl(key, 7 * 24 * 60 * 60)
      }

      // Update purchase
      await supabase
        .from('purchases')
        .update({
          download_urls: links,
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchase_id)

      return new Response(
        JSON.stringify({
          success: true,
          links,
          downloads_remaining: purchase.downloads_remaining,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action. Use: generate, get_links, record_download, regenerate')
  } catch (error) {
    console.error('Download links error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
