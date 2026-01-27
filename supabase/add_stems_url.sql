-- Add stems_url to beats table for project files
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='beats' AND column_name='stems_url') THEN
    ALTER TABLE beats ADD COLUMN stems_url TEXT;
  END IF;
END $$;