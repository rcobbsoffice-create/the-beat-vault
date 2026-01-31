-- 1. Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    user_id UUID REFERENCES profiles (id) ON DELETE CASCADE NOT NULL,
    beat_id UUID REFERENCES beats (id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, beat_id)
);

-- 2. Add favorite_count to beats if it doesn't exist
ALTER TABLE beats
ADD COLUMN IF NOT EXISTS favorite_count BIGINT DEFAULT 0;

-- 3. Enable RLS on favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own favorites' AND tablename = 'favorites') THEN
    CREATE POLICY "Users can view their own favorites"
      ON favorites FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can add their own favorites' AND tablename = 'favorites') THEN
    CREATE POLICY "Users can add their own favorites"
      ON favorites FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can remove their own favorites' AND tablename = 'favorites') THEN
    CREATE POLICY "Users can remove their own favorites"
      ON favorites FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Toggle Favorite RPC
CREATE OR REPLACE FUNCTION toggle_favorite(beat_id UUID)
RETURNS JSON AS $$
DECLARE
  existing_id UUID;
  new_count BIGINT;
  was_added BOOLEAN;
BEGIN
  -- Check if user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT id INTO existing_id FROM favorites 
  WHERE favorites.beat_id = toggle_favorite.beat_id AND user_id = auth.uid();

  IF existing_id IS NOT NULL THEN
    DELETE FROM favorites WHERE id = existing_id;
    was_added := FALSE;
  ELSE
    INSERT INTO favorites (user_id, beat_id) VALUES (auth.uid(), toggle_favorite.beat_id);
    was_added := TRUE;
  END IF;

  -- Update count in beats table
  UPDATE beats SET favorite_count = (SELECT count(*) FROM favorites WHERE favorites.beat_id = toggle_favorite.beat_id)
  WHERE id = toggle_favorite.beat_id
  RETURNING favorite_count INTO new_count;

  RETURN json_build_object('added', was_added, 'count', new_count);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;