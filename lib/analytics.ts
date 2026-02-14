import { supabase } from './supabase';

export type AnalyticsEventType = 'play' | 'view' | 'wishlist' | 'cart_add' | 'purchase';

export const trackEvent = async (
  eventType: AnalyticsEventType,
  beatId: string,
  metadata: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Attempt tracking insert
    const { error: insertError } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      beat_id: beatId,
      user_id: user?.id || null,
      metadata
    });

    if (insertError) {
      console.warn(`Analytics insert failed for ${eventType}:`, insertError.message);
    }

    // Attempt RPC increment
    if (eventType === 'play') {
      const { error: playError } = await supabase.rpc('increment_play_count', { beat_id: beatId });
      if (playError) console.warn('increment_play_count failed:', playError.message);
    } else if (eventType === 'view') {
      const { error: viewError } = await supabase.rpc('increment_view_count', { beat_id: beatId });
      if (viewError) console.warn('increment_view_count failed:', viewError.message);
    }

  } catch (err: any) {
    console.error(`Uncaught error in trackEvent (${eventType}):`, err.message || err);
  }
};
