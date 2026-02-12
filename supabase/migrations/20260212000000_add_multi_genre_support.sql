-- Add genres array column to beats table
ALTER TABLE beats ADD COLUMN IF NOT EXISTS genres TEXT[] DEFAULT '{}';

-- Migrate existing single genre data to the new genres array
UPDATE beats 
SET genres = ARRAY[genre] 
WHERE genre IS NOT NULL AND (genres IS NULL OR array_length(genres, 1) IS NULL);

-- Add index for faster genre searching
CREATE INDEX IF NOT EXISTS idx_beats_genres ON beats USING GIN (genres);