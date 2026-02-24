import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Secret key for authenticating cron requests
const CRON_SECRET = Deno.env.get('CRON_SECRET') || ''

// Helper to verify cron request
function verifyCronRequest(req: Request): boolean {
  const authHeader = req.headers.get('Authorization')
  if (authHeader === `Bearer ${CRON_SECRET}`) return true
  
  // Also allow from Supabase scheduler (pg_cron)
  const cronHeader = req.headers.get('X-Supabase-Cron')
  return cronHeader === 'true'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verify this is an authorized cron request
  if (!verifyCronRequest(req)) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { headers: { 'Content-Type': 'application/json' }, status: 401 }
    )
  }

  try {
    const { task } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const results: Record<string, any> = {
      task,
      started_at: new Date().toISOString(),
    }

    switch (task) {
      // ============================================
      // TASK: Sync fingerprint detections
      // Schedule: Every 6 hours
      // ============================================
      case 'sync_fingerprints': {
        // Get all beats with monitoring enabled
        const { data: fingerprints } = await supabase
          .from('audio_fingerprints')
          .select('beat_id, acrcloud_fingerprint_id')
          .eq('monitoring_enabled', true)

        let synced = 0
        let errors = 0

        for (const fp of fingerprints || []) {
          try {
            // Call ACRCloud sync function
            const { error } = await supabase.functions.invoke('sync-detections', {
              body: { beat_id: fp.beat_id }
            })
            if (!error) synced++
            else errors++
          } catch (e) {
            errors++
          }
        }

        // Update last scan timestamps
        await supabase
          .from('audio_fingerprints')
          .update({ last_scan_at: new Date().toISOString() })
          .eq('monitoring_enabled', true)

        results.fingerprints_synced = synced
        results.fingerprint_errors = errors
        break
      }

      // ============================================
      // TASK: Generate analytics aggregates
      // Schedule: Daily at midnight
      // ============================================
      case 'aggregate_analytics': {
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        // Aggregate beat analytics
        const { data: events } = await supabase
          .from('analytics_events')
          .select('beat_id, event_type')
          .gte('created_at', yesterday)
          .lt('created_at', yesterday + 'T23:59:59Z')

        const beatStats: Record<string, { plays: number; views: number }> = {}
        
        for (const event of events || []) {
          if (!event.beat_id) continue
          if (!beatStats[event.beat_id]) {
            beatStats[event.beat_id] = { plays: 0, views: 0 }
          }
          if (event.event_type === 'beat_play') beatStats[event.beat_id].plays++
          if (event.event_type === 'beat_view') beatStats[event.beat_id].views++
        }

        // Update daily stats table (create if needed)
        const statsRecords = Object.entries(beatStats).map(([beat_id, stats]) => ({
          beat_id,
          date: yesterday,
          plays: stats.plays,
          views: stats.views,
        }))

        if (statsRecords.length > 0) {
          await supabase
            .from('beat_daily_stats')
            .upsert(statsRecords, { onConflict: 'beat_id,date' })
        }

        // Update admin global stats
        const totalPlays = Object.values(beatStats).reduce((sum, s) => sum + s.plays, 0)
        const totalViews = Object.values(beatStats).reduce((sum, s) => sum + s.views, 0)

        await supabase
          .from('admin_fingerprint_global_stats')
          .insert({
            period_start: yesterday,
            period_end: yesterday,
            total_tracked_beats: Object.keys(beatStats).length,
            updated_at: new Date().toISOString(),
          })

        results.beats_aggregated = Object.keys(beatStats).length
        results.total_plays = totalPlays
        results.total_views = totalViews
        break
      }

      // ============================================
      // TASK: Clean up expired download tokens
      // Schedule: Daily at 2 AM
      // ============================================
      case 'cleanup_downloads': {
        const now = new Date().toISOString()

        const { data: deleted, error } = await supabase
          .from('download_tokens')
          .delete()
          .lt('expires_at', now)
          .select('id')

        results.tokens_cleaned = deleted?.length || 0
        break
      }

      // ============================================
      // TASK: Send scheduled newsletters
      // Schedule: Every hour
      // ============================================
      case 'send_scheduled_newsletters': {
        const now = new Date().toISOString()

        const { data: scheduled } = await supabase
          .from('newsletters')
          .select('id')
          .eq('status', 'scheduled')
          .lte('scheduled_for', now)

        let sent = 0
        let errors = 0

        for (const newsletter of scheduled || []) {
          try {
            const { error } = await supabase.functions.invoke('send-email', {
              body: { newsletter_id: newsletter.id }
            })
            if (!error) sent++
            else errors++
          } catch (e) {
            errors++
          }
        }

        results.newsletters_sent = sent
        results.newsletter_errors = errors
        break
      }

      // ============================================
      // TASK: Sync DSP distribution data
      // Schedule: Daily at 6 AM
      // ============================================
      case 'sync_distribution': {
        // Get artists with DSP credentials
        const { data: artists } = await supabase
          .from('artist_profiles_ext')
          .select('profile_id, social_links')

        let synced = 0

        for (const artist of artists || []) {
          const links = artist.social_links as Record<string, any> || {}
          
          // Sync if they have connected accounts
          if (links.spotify_artist_id || links.youtube_channel_id) {
            try {
              await supabase.functions.invoke('dsp-sync', {
                body: {
                  action: 'sync_all',
                  spotify_artist_id: links.spotify_artist_id,
                  youtube_channel_id: links.youtube_channel_id,
                  soundcloud_user_id: links.soundcloud_user_id,
                }
              })
              synced++
            } catch (e) {
              console.error(`DSP sync error for ${artist.profile_id}:`, e)
            }
          }
        }

        results.artists_synced = synced
        break
      }

      // ============================================
      // TASK: Generate weekly charts
      // Schedule: Every Monday at 12 AM
      // ============================================
      case 'generate_charts': {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        
        // Get play counts for the week
        const { data: events } = await supabase
          .from('analytics_events')
          .select('beat_id')
          .eq('event_type', 'beat_play')
          .gte('created_at', weekAgo)

        const beatPlays: Record<string, number> = {}
        for (const event of events || []) {
          if (event.beat_id) {
            beatPlays[event.beat_id] = (beatPlays[event.beat_id] || 0) + 1
          }
        }

        // Get beat details
        const beatIds = Object.keys(beatPlays).slice(0, 100)
        const { data: beats } = await supabase
          .from('beats')
          .select('id, title, producer:profiles!producer_id(display_name), artwork_url')
          .in('id', beatIds)

        // Get current chart for position comparison
        const { data: currentChart } = await supabase
          .from('charts')
          .select('beat_id, rank')
          .eq('chart_type', 'top_100')
          .order('created_at', { ascending: false })
          .limit(100)

        const currentRanks: Record<string, number> = {}
        for (const entry of currentChart || []) {
          if (entry.beat_id) currentRanks[entry.beat_id] = entry.rank
        }

        // Create new chart entries
        const sortedBeats = beatIds
          .map(id => ({
            id,
            plays: beatPlays[id],
            beat: beats?.find(b => b.id === id),
          }))
          .sort((a, b) => b.plays - a.plays)
          .slice(0, 100)

        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Start of week

        const chartEntries = sortedBeats.map((item, index) => ({
          rank: index + 1,
          last_rank: currentRanks[item.id] || null,
          title: item.beat?.title || 'Unknown',
          artist_name: (item.beat?.producer as any)?.display_name || 'Unknown',
          beat_id: item.id,
          image_url: item.beat?.artwork_url,
          chart_type: 'top_100',
          week_start: weekStart.toISOString().split('T')[0],
        }))

        // Insert new chart
        if (chartEntries.length > 0) {
          await supabase.from('charts').insert(chartEntries)
        }

        results.chart_entries_created = chartEntries.length
        break
      }

      // ============================================
      // TASK: Process pending questionnaires
      // Schedule: Every 15 minutes
      // ============================================
      case 'process_questionnaires': {
        const { data: pending } = await supabase
          .from('artist_questionnaires')
          .select('id')
          .eq('status', 'pending')
          .order('created_at', { ascending: true })
          .limit(5)

        let processed = 0

        for (const q of pending || []) {
          try {
            await supabase.functions.invoke('generate-artist-content', {
              body: { questionnaire_id: q.id }
            })
            processed++
          } catch (e) {
            console.error(`Questionnaire processing error for ${q.id}:`, e)
          }
        }

        results.questionnaires_processed = processed
        break
      }

      // ============================================
      // TASK: Update beat tracking summaries
      // Schedule: Every 4 hours
      // ============================================
      case 'update_tracking_summaries': {
        // Get beats with recent detections
        const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        
        const { data: recentDetections } = await supabase
          .from('track_detections')
          .select('beat_id')
          .gte('created_at', fourHoursAgo)

        const beatIds = [...new Set(recentDetections?.map(d => d.beat_id) || [])]
        
        let updated = 0
        for (const beatId of beatIds) {
          try {
            await supabase.rpc('update_beat_tracking_summary', { beat_id_param: beatId })
            updated++
          } catch (e) {
            console.error(`Tracking summary error for ${beatId}:`, e)
          }
        }

        results.summaries_updated = updated
        break
      }

      default:
        throw new Error(`Unknown task: ${task}. Available: sync_fingerprints, aggregate_analytics, cleanup_downloads, send_scheduled_newsletters, sync_distribution, generate_charts, process_questionnaires, update_tracking_summaries`)
    }

    results.completed_at = new Date().toISOString()
    results.duration_ms = new Date(results.completed_at).getTime() - new Date(results.started_at).getTime()

    // Log cron execution
    await supabase
      .from('cron_logs')
      .insert({
        task,
        results,
        status: 'success',
      })

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Cron task error:', error)

    // Log error
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    try {
      await supabase
        .from('cron_logs')
        .insert({
          task: (await req.clone().json()).task || 'unknown',
          results: { error: error.message },
          status: 'error',
        })
    } catch (e) {
      // Ignore logging errors
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
