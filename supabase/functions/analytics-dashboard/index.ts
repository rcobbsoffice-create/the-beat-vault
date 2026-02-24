import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DateRange {
  start: string
  end: string
}

interface AnalyticsData {
  summary: {
    total_plays: number
    total_views: number
    total_favorites: number
    total_purchases: number
    total_revenue: number
    period_change: {
      plays: number
      views: number
      revenue: number
    }
  }
  time_series: {
    date: string
    plays: number
    views: number
    revenue: number
  }[]
  top_beats: {
    id: string
    title: string
    plays: number
    views: number
    revenue: number
    artwork_url: string
  }[]
  geographic: {
    country: string
    plays: number
    revenue: number
  }[]
  traffic_sources: {
    source: string
    visits: number
    percentage: number
  }[]
  realtime: {
    active_listeners: number
    plays_last_hour: number
    trending_beat: string
  }
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
      dashboard_type,  // 'producer' | 'artist' | 'admin'
      date_range,      // { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
      beat_id,         // Optional: for single beat analytics
      metric,          // Optional: specific metric to fetch
    } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify user role for admin dashboard
    if (dashboard_type === 'admin') {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin') {
        throw new Error('Admin access required')
      }
    }

    const now = new Date()
    const defaultStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
    const range: DateRange = {
      start: date_range?.start || defaultStart.toISOString().split('T')[0],
      end: date_range?.end || now.toISOString().split('T')[0],
    }

    // Calculate previous period for comparison
    const periodLength = Math.ceil((new Date(range.end).getTime() - new Date(range.start).getTime()) / (1000 * 60 * 60 * 24))
    const prevStart = new Date(new Date(range.start).getTime() - periodLength * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const prevEnd = new Date(new Date(range.start).getTime() - 1).toISOString().split('T')[0]

    // ===== PRODUCER DASHBOARD =====
    if (dashboard_type === 'producer') {
      // Get producer's beats
      const { data: beats } = await supabase
        .from('beats')
        .select('id, title, play_count, view_count, favorite_count, artwork_url')
        .eq('producer_id', user.id)

      const beatIds = beats?.map(b => b.id) || []

      // Get analytics events for the period
      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, beat_id, created_at, metadata')
        .in('beat_id', beatIds)
        .gte('created_at', range.start)
        .lte('created_at', range.end + 'T23:59:59Z')

      // Get purchases
      const { data: purchases } = await supabase
        .from('purchases')
        .select('amount_producer, created_at, beat_id')
        .eq('producer_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', range.start)
        .lte('created_at', range.end + 'T23:59:59Z')

      // Previous period data for comparison
      const { data: prevEvents } = await supabase
        .from('analytics_events')
        .select('event_type')
        .in('beat_id', beatIds)
        .gte('created_at', prevStart)
        .lte('created_at', prevEnd + 'T23:59:59Z')

      const { data: prevPurchases } = await supabase
        .from('purchases')
        .select('amount_producer')
        .eq('producer_id', user.id)
        .eq('status', 'completed')
        .gte('created_at', prevStart)
        .lte('created_at', prevEnd + 'T23:59:59Z')

      // Calculate metrics
      const currentPlays = events?.filter(e => e.event_type === 'beat_play').length || 0
      const currentViews = events?.filter(e => e.event_type === 'beat_view').length || 0
      const currentRevenue = purchases?.reduce((sum, p) => sum + (p.amount_producer / 100), 0) || 0
      
      const prevPlays = prevEvents?.filter(e => e.event_type === 'beat_play').length || 0
      const prevViews = prevEvents?.filter(e => e.event_type === 'beat_view').length || 0
      const prevRevenue = prevPurchases?.reduce((sum, p) => sum + (p.amount_producer / 100), 0) || 0

      // Build time series (daily)
      const timeSeries: Record<string, { plays: number; views: number; revenue: number }> = {}
      const currentDate = new Date(range.start)
      while (currentDate <= new Date(range.end)) {
        const dateStr = currentDate.toISOString().split('T')[0]
        timeSeries[dateStr] = { plays: 0, views: 0, revenue: 0 }
        currentDate.setDate(currentDate.getDate() + 1)
      }

      events?.forEach(e => {
        const date = e.created_at.split('T')[0]
        if (timeSeries[date]) {
          if (e.event_type === 'beat_play') timeSeries[date].plays++
          if (e.event_type === 'beat_view') timeSeries[date].views++
        }
      })

      purchases?.forEach(p => {
        const date = p.created_at.split('T')[0]
        if (timeSeries[date]) {
          timeSeries[date].revenue += p.amount_producer / 100
        }
      })

      // Top beats
      const beatStats: Record<string, { plays: number; views: number; revenue: number }> = {}
      events?.forEach(e => {
        if (!beatStats[e.beat_id]) beatStats[e.beat_id] = { plays: 0, views: 0, revenue: 0 }
        if (e.event_type === 'beat_play') beatStats[e.beat_id].plays++
        if (e.event_type === 'beat_view') beatStats[e.beat_id].views++
      })
      purchases?.forEach(p => {
        if (!beatStats[p.beat_id]) beatStats[p.beat_id] = { plays: 0, views: 0, revenue: 0 }
        beatStats[p.beat_id].revenue += p.amount_producer / 100
      })

      const topBeats = beats
        ?.map(b => ({
          id: b.id,
          title: b.title,
          artwork_url: b.artwork_url,
          plays: beatStats[b.id]?.plays || 0,
          views: beatStats[b.id]?.views || 0,
          revenue: beatStats[b.id]?.revenue || 0,
        }))
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10) || []

      // Real-time data (last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const { data: recentEvents } = await supabase
        .from('analytics_events')
        .select('event_type, beat_id')
        .in('beat_id', beatIds)
        .gte('created_at', oneHourAgo)

      const playsLastHour = recentEvents?.filter(e => e.event_type === 'beat_play').length || 0
      
      // Trending beat (most played in last hour)
      const recentPlays: Record<string, number> = {}
      recentEvents?.filter(e => e.event_type === 'beat_play').forEach(e => {
        recentPlays[e.beat_id] = (recentPlays[e.beat_id] || 0) + 1
      })
      const trendingBeatId = Object.entries(recentPlays).sort(([,a], [,b]) => b - a)[0]?.[0]
      const trendingBeat = beats?.find(b => b.id === trendingBeatId)?.title || ''

      const analytics: AnalyticsData = {
        summary: {
          total_plays: currentPlays,
          total_views: currentViews,
          total_favorites: beats?.reduce((sum, b) => sum + (b.favorite_count || 0), 0) || 0,
          total_purchases: purchases?.length || 0,
          total_revenue: currentRevenue,
          period_change: {
            plays: prevPlays > 0 ? Math.round(((currentPlays - prevPlays) / prevPlays) * 100) : 0,
            views: prevViews > 0 ? Math.round(((currentViews - prevViews) / prevViews) * 100) : 0,
            revenue: prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0,
          },
        },
        time_series: Object.entries(timeSeries).map(([date, data]) => ({
          date,
          ...data,
        })),
        top_beats: topBeats,
        geographic: [], // Would need IP geolocation data
        traffic_sources: [], // Would need referrer data
        realtime: {
          active_listeners: Math.floor(playsLastHour / 3), // Estimate
          plays_last_hour: playsLastHour,
          trending_beat: trendingBeat,
        },
      }

      return new Response(
        JSON.stringify({ success: true, analytics }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== ADMIN DASHBOARD =====
    if (dashboard_type === 'admin') {
      // Platform-wide analytics
      const { data: totalBeats } = await supabase
        .from('beats')
        .select('id', { count: 'exact' })
        .eq('status', 'published')

      const { data: totalUsers } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })

      const { data: totalProducers } = await supabase
        .from('producers')
        .select('id', { count: 'exact' })
        .eq('status', 'active')

      const { data: purchases } = await supabase
        .from('purchases')
        .select('amount_total, amount_platform, created_at')
        .eq('status', 'completed')
        .gte('created_at', range.start)
        .lte('created_at', range.end + 'T23:59:59Z')

      const { data: events } = await supabase
        .from('analytics_events')
        .select('event_type, created_at')
        .gte('created_at', range.start)
        .lte('created_at', range.end + 'T23:59:59Z')

      const totalRevenue = purchases?.reduce((sum, p) => sum + (p.amount_total / 100), 0) || 0
      const platformRevenue = purchases?.reduce((sum, p) => sum + (p.amount_platform / 100), 0) || 0
      const totalPlays = events?.filter(e => e.event_type === 'beat_play').length || 0

      return new Response(
        JSON.stringify({
          success: true,
          analytics: {
            platform_stats: {
              total_beats: totalBeats?.length || 0,
              total_users: totalUsers?.length || 0,
              total_producers: totalProducers?.length || 0,
              total_revenue: totalRevenue,
              platform_revenue: platformRevenue,
              total_plays: totalPlays,
              total_purchases: purchases?.length || 0,
            },
            date_range: range,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ===== SINGLE BEAT ANALYTICS =====
    if (beat_id) {
      const { data: beat } = await supabase
        .from('beats')
        .select('*')
        .eq('id', beat_id)
        .single()

      if (!beat) throw new Error('Beat not found')

      // Verify ownership or admin
      if (beat.producer_id !== user.id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()
        
        if (profile?.role !== 'admin') {
          throw new Error('Unauthorized')
        }
      }

      const { data: events } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('beat_id', beat_id)
        .gte('created_at', range.start)
        .order('created_at', { ascending: false })

      const { data: purchases } = await supabase
        .from('purchases')
        .select('*')
        .eq('beat_id', beat_id)
        .eq('status', 'completed')

      return new Response(
        JSON.stringify({
          success: true,
          beat_analytics: {
            beat,
            plays: events?.filter(e => e.event_type === 'beat_play').length || 0,
            views: events?.filter(e => e.event_type === 'beat_view').length || 0,
            favorites: beat.favorite_count || 0,
            purchases: purchases?.length || 0,
            revenue: purchases?.reduce((sum, p) => sum + (p.amount_producer / 100), 0) || 0,
            recent_events: events?.slice(0, 50),
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error('Invalid request. Specify dashboard_type or beat_id')
  } catch (error) {
    console.error('Analytics error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
