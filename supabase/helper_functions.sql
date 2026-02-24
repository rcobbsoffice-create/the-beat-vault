-- =====================================================
-- HELPER SQL FUNCTIONS
-- =====================================================
-- Additional utility functions for the database
-- Execute AFTER running complete_schema.sql
-- =====================================================

-- Function to increment purchase count
CREATE OR REPLACE FUNCTION increment_purchase_count(beat_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET purchase_count = COALESCE(purchase_count, 0) + 1,
      updated_at = NOW()
  WHERE id = beat_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get beat analytics
CREATE OR REPLACE FUNCTION get_beat_analytics(beat_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'beat_id', b.id,
    'title', b.title,
    'play_count', b.play_count,
    'view_count', b.view_count,
    'favorite_count', b.favorite_count,
    'purchase_count', b.purchase_count,
    'total_revenue', COALESCE(SUM(p.amount_producer), 0),
    'last_played', (
      SELECT MAX(created_at) 
      FROM analytics_events 
      WHERE beat_id = b.id AND event_type = 'beat_play'
    )
  ) INTO result
  FROM beats b
  LEFT JOIN purchases p ON p.beat_id = b.id AND p.status = 'completed'
  WHERE b.id = beat_id_param
  GROUP BY b.id, b.title, b.play_count, b.view_count, b.favorite_count, b.purchase_count;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get producer analytics
CREATE OR REPLACE FUNCTION get_producer_analytics(producer_id_param UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_beats', COUNT(DISTINCT b.id),
    'published_beats', COUNT(DISTINCT CASE WHEN b.status = 'published' THEN b.id END),
    'total_plays', COALESCE(SUM(b.play_count), 0),
    'total_views', COALESCE(SUM(b.view_count), 0),
    'total_favorites', COALESCE(SUM(b.favorite_count), 0),
    'total_purchases', COUNT(DISTINCT p.id) FILTER (WHERE p.status = 'completed'),
    'total_revenue', COALESCE(SUM(p.amount_producer), 0),
    'this_month_revenue', COALESCE(
      SUM(CASE 
        WHEN p.created_at >= date_trunc('month', CURRENT_DATE) 
        THEN p.amount_producer 
        ELSE 0 
      END), 0
    )
  ) INTO result
  FROM beats b
  LEFT JOIN purchases p ON p.beat_id = b.id AND p.status = 'completed'
  WHERE b.producer_id = producer_id_param
  GROUP BY b.producer_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search beats with filters
CREATE OR REPLACE FUNCTION search_beats(
  search_query TEXT DEFAULT NULL,
  genre_filter TEXT DEFAULT NULL,
  min_bpm INTEGER DEFAULT NULL,
  max_bpm INTEGER DEFAULT NULL,
  sort_by TEXT DEFAULT 'created_at',
  sort_order TEXT DEFAULT 'DESC',
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  producer_id UUID,
  genre TEXT,
  bpm INTEGER,
  artwork_url TEXT,
  preview_url TEXT,
  play_count BIGINT,
  favorite_count BIGINT,
  created_at TIMESTAMP WITH TIME ZONE,
  producer_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.producer_id,
    b.genre,
    b.bpm,
    b.artwork_url,
    b.preview_url,
    b.play_count,
    b.favorite_count,
    b.created_at,
    p.display_name as producer_name
  FROM beats b
  LEFT JOIN profiles p ON p.id = b.producer_id
  WHERE b.status = 'published'
    AND (search_query IS NULL OR b.title ILIKE '%' || search_query || '%')
    AND (genre_filter IS NULL OR b.genre = genre_filter)
    AND (min_bpm IS NULL OR b.bpm >= min_bpm)
    AND (max_bpm IS NULL OR b.bpm <= max_bpm)
  ORDER BY 
    CASE WHEN sort_by = 'created_at' AND sort_order = 'DESC' THEN b.created_at END DESC,
    CASE WHEN sort_by = 'created_at' AND sort_order = 'ASC' THEN b.created_at END ASC,
    CASE WHEN sort_by = 'play_count' AND sort_order = 'DESC' THEN b.play_count END DESC,
    CASE WHEN sort_by = 'play_count' AND sort_order = 'ASC' THEN b.play_count END ASC,
    CASE WHEN sort_by = 'title' AND sort_order = 'ASC' THEN b.title END ASC,
    CASE WHEN sort_by = 'title' AND sort_order = 'DESC' THEN b.title END DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update beat tracking summary (called by webhook)
CREATE OR REPLACE FUNCTION update_beat_tracking_summary(beat_id_param UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO beat_tracking_summary (
    beat_id,
    total_detections,
    total_views,
    total_estimated_revenue,
    platforms_detected,
    last_detection_at,
    updated_at
  )
  SELECT
    td.beat_id,
    COUNT(*) as total_detections,
    COALESCE(SUM(td.view_count), 0) as total_views,
    COALESCE(SUM(td.estimated_revenue), 0) as total_estimated_revenue,
    json_object_agg(td.platform, COUNT(*)) as platforms_detected,
    MAX(td.detected_at) as last_detection_at,
    NOW() as updated_at
  FROM track_detections td
  WHERE td.beat_id = beat_id_param
  GROUP BY td.beat_id
  ON CONFLICT (beat_id) DO UPDATE SET
    total_detections = EXCLUDED.total_detections,
    total_views = EXCLUDED.total_views,
    total_estimated_revenue = EXCLUDED.total_estimated_revenue,
    platforms_detected = EXCLUDED.platforms_detected,
    last_detection_at = EXCLUDED.last_detection_at,
    updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get trending beats (for homepage)
CREATE OR REPLACE FUNCTION get_trending_beats(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id UUID,
  title TEXT,
  producer_id UUID,
  producer_name TEXT,
  genre TEXT,
  bpm INTEGER,
  artwork_url TEXT,
  preview_url TEXT,
  play_count BIGINT,
  trending_score NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id,
    b.title,
    b.producer_id,
    p.display_name as producer_name,
    b.genre,
    b.bpm,
    b.artwork_url,
    b.preview_url,
    b.play_count,
    -- Trending score: weighted combination of plays, views, and recency
    (
      COALESCE(b.play_count, 0) * 2 + 
      COALESCE(b.view_count, 0) + 
      COALESCE(b.favorite_count, 0) * 3 +
      -- Boost for recent beats (last 30 days)
      CASE 
        WHEN b.created_at > NOW() - INTERVAL '30 days' 
        THEN 100 
        ELSE 0 
      END
    )::NUMERIC as trending_score
  FROM beats b
  LEFT JOIN profiles p ON p.id = b.producer_id
  WHERE b.status = 'published'
  ORDER BY trending_score DESC, b.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- END OF HELPER FUNCTIONS
-- =====================================================
