import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// DSP API Configuration
const SPOTIFY_CLIENT_ID = Deno.env.get('SPOTIFY_CLIENT_ID') || ''
const SPOTIFY_CLIENT_SECRET = Deno.env.get('SPOTIFY_CLIENT_SECRET') || ''
const DISTROKID_API_KEY = Deno.env.get('DISTROKID_API_KEY') || ''
const SOUNDCLOUD_CLIENT_ID = Deno.env.get('SOUNDCLOUD_CLIENT_ID') || ''
const YOUTUBE_API_KEY = Deno.env.get('YOUTUBE_API_KEY') || ''

interface DSPData {
  dsp: string
  stream_count: number
  revenue_usd: number
  country_code?: string
  period_start: string
  period_end: string
  track_id?: string
  track_name?: string
}

// Spotify Analytics API
async function fetchSpotifyAnalytics(artistId: string, accessToken: string): Promise<DSPData[]> {
  const results: DSPData[] = []
  
  try {
    // Get artist's top tracks with play counts
    const tracksResponse = await fetch(
      `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=US`,
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )
    
    if (tracksResponse.ok) {
      const data = await tracksResponse.json()
      const today = new Date().toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      for (const track of data.tracks || []) {
        results.push({
          dsp: 'spotify',
          stream_count: track.popularity * 10000, // Estimate based on popularity
          revenue_usd: (track.popularity * 10000) * 0.004, // ~$0.004 per stream
          period_start: monthAgo,
          period_end: today,
          track_id: track.id,
          track_name: track.name,
        })
      }
    }
  } catch (error) {
    console.error('Spotify fetch error:', error)
  }
  
  return results
}

// YouTube Analytics API
async function fetchYouTubeAnalytics(channelId: string): Promise<DSPData[]> {
  const results: DSPData[] = []
  
  try {
    // Get channel videos with view counts
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&type=video&maxResults=50&key=${YOUTUBE_API_KEY}`
    )
    
    if (response.ok) {
      const data = await response.json()
      const videoIds = data.items?.map((item: any) => item.id.videoId).join(',')
      
      if (videoIds) {
        const statsResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`
        )
        
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          const today = new Date().toISOString().split('T')[0]
          const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          
          for (const video of statsData.items || []) {
            const views = parseInt(video.statistics?.viewCount || '0')
            results.push({
              dsp: 'youtube',
              stream_count: views,
              revenue_usd: views * 0.002, // ~$2 per 1000 views
              period_start: monthAgo,
              period_end: today,
              track_id: video.id,
              track_name: video.snippet?.title,
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('YouTube fetch error:', error)
  }
  
  return results
}

// SoundCloud Analytics (using public API)
async function fetchSoundCloudAnalytics(userId: string): Promise<DSPData[]> {
  const results: DSPData[] = []
  
  try {
    const response = await fetch(
      `https://api.soundcloud.com/users/${userId}/tracks?client_id=${SOUNDCLOUD_CLIENT_ID}&limit=50`
    )
    
    if (response.ok) {
      const tracks = await response.json()
      const today = new Date().toISOString().split('T')[0]
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      for (const track of tracks) {
        results.push({
          dsp: 'soundcloud',
          stream_count: track.playback_count || 0,
          revenue_usd: (track.playback_count || 0) * 0.003, // Estimate
          period_start: monthAgo,
          period_end: today,
          track_id: track.id.toString(),
          track_name: track.title,
        })
      }
    }
  } catch (error) {
    console.error('SoundCloud fetch error:', error)
  }
  
  return results
}

// DistroKid API Integration (if available)
async function fetchDistroKidAnalytics(artistToken: string): Promise<DSPData[]> {
  const results: DSPData[] = []
  
  try {
    // DistroKid requires artist OAuth token
    const response = await fetch('https://distrokid.com/api/v1/analytics/streams', {
      headers: {
        'Authorization': `Bearer ${artistToken}`,
        'X-API-Key': DISTROKID_API_KEY,
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      
      for (const entry of data.streams || []) {
        results.push({
          dsp: entry.store || 'distrokid',
          stream_count: entry.streams || 0,
          revenue_usd: entry.earnings || 0,
          country_code: entry.country,
          period_start: entry.start_date,
          period_end: entry.end_date,
          track_id: entry.track_id,
          track_name: entry.track_name,
        })
      }
    }
  } catch (error) {
    console.error('DistroKid fetch error:', error)
  }
  
  return results
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { 
      action,
      dsp,
      spotify_artist_id,
      spotify_access_token,
      youtube_channel_id,
      soundcloud_user_id,
      distrokid_token,
    } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let allData: DSPData[] = []

    // Sync specific DSP or all
    if (action === 'sync' || action === 'sync_all') {
      // Spotify
      if ((dsp === 'spotify' || action === 'sync_all') && spotify_artist_id && spotify_access_token) {
        const spotifyData = await fetchSpotifyAnalytics(spotify_artist_id, spotify_access_token)
        allData = [...allData, ...spotifyData]
      }

      // YouTube
      if ((dsp === 'youtube' || action === 'sync_all') && youtube_channel_id && YOUTUBE_API_KEY) {
        const youtubeData = await fetchYouTubeAnalytics(youtube_channel_id)
        allData = [...allData, ...youtubeData]
      }

      // SoundCloud
      if ((dsp === 'soundcloud' || action === 'sync_all') && soundcloud_user_id && SOUNDCLOUD_CLIENT_ID) {
        const soundcloudData = await fetchSoundCloudAnalytics(soundcloud_user_id)
        allData = [...allData, ...soundcloudData]
      }

      // DistroKid
      if ((dsp === 'distrokid' || action === 'sync_all') && distrokid_token && DISTROKID_API_KEY) {
        const distrokidData = await fetchDistroKidAnalytics(distrokid_token)
        allData = [...allData, ...distrokidData]
      }

      // Insert data into database
      if (allData.length > 0) {
        const records = allData.map(d => ({
          artist_id: user.id,
          dsp: d.dsp,
          stream_count: d.stream_count,
          revenue_usd: d.revenue_usd,
          country_code: d.country_code,
          period_start: d.period_start,
          period_end: d.period_end,
        }))

        const { error: insertError } = await supabase
          .from('distribution_data')
          .upsert(records)

        if (insertError) {
          console.error('Insert error:', insertError)
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          synced_records: allData.length,
          dsps_synced: [...new Set(allData.map(d => d.dsp))],
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get aggregated analytics
    if (action === 'get_analytics') {
      const { data: analytics, error } = await supabase
        .from('distribution_data')
        .select('*')
        .eq('artist_id', user.id)
        .order('period_end', { ascending: false })

      if (error) throw error

      // Aggregate by DSP
      const aggregated: Record<string, { streams: number; revenue: number }> = {}
      for (const row of analytics || []) {
        if (!aggregated[row.dsp]) {
          aggregated[row.dsp] = { streams: 0, revenue: 0 }
        }
        aggregated[row.dsp].streams += row.stream_count || 0
        aggregated[row.dsp].revenue += parseFloat(row.revenue_usd) || 0
      }

      const totalStreams = Object.values(aggregated).reduce((sum, d) => sum + d.streams, 0)
      const totalRevenue = Object.values(aggregated).reduce((sum, d) => sum + d.revenue, 0)

      return new Response(
        JSON.stringify({
          success: true,
          by_dsp: aggregated,
          total_streams: totalStreams,
          total_revenue: totalRevenue.toFixed(2),
          raw_data: analytics,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid action. Use: sync, sync_all, get_analytics')
  } catch (error) {
    console.error('DSP sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
