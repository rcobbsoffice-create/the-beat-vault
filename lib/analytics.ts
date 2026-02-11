import { supabase } from './supabase';

export type AnalyticsEventType = 'play' | 'view' | 'wishlist' | 'cart_add' | 'purchase';

export const trackEvent = async (
  eventType: AnalyticsEventType,
  beatId: string,
  metadata: Record<string, any> = {}
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('analytics_events').insert({
      event_type: eventType,
      beat_id: beatId,
      user_id: user?.id || null,
      metadata
    });

    if (error) throw error;

    // If it's a play or view, we might also want to increment the respective count in the beats table
    if (eventType === 'play') {
      await supabase.rpc('increment_play_count', { beat_id: beatId });
    } else if (eventType === 'view') {
      await supabase.rpc('increment_view_count', { beat_id: beatId });
    }

  } catch (err) {
    console.error(`Error tracking ${eventType}:`, err);
  }
};
