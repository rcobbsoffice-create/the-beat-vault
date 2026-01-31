-- Add view_count to beats if it doesn't exist
ALTER TABLE beats
ADD COLUMN IF NOT EXISTS view_count BIGINT DEFAULT 0;

-- Function to increment play count
CREATE OR REPLACE FUNCTION increment_play_count(beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET play_count = COALESCE(play_count, 0) + 1
  WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(beat_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE beats
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = beat_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;