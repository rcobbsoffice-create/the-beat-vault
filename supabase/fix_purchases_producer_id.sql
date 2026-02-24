-- =====================================================
-- FIX: MISSING producer_id IN purchases TABLE
-- =====================================================
-- This script adds the missing producer_id column to the
-- purchases table and populates it for existing records.
-- =====================================================

-- 1. Add the missing producer_id column if it doesn't exist
-- References profiles(id) to match the logic in the beats table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='purchases' AND column_name='producer_id') THEN
        ALTER TABLE purchases 
        ADD COLUMN producer_id UUID REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 2. Populate producer_id from the beats table for existing records
-- This ensures that historical data is correctly linked
UPDATE purchases p
SET
    producer_id = b.producer_id
FROM beats b
WHERE
    p.beat_id = b.id
    AND p.producer_id IS NULL;

-- 3. Re-apply the RLS policy that often fails when the column is missing
DROP POLICY IF EXISTS "Producers can view purchases of their beats" ON purchases;

CREATE POLICY "Producers can view purchases of their beats" ON purchases FOR
SELECT USING (auth.uid () = producer_id);

-- 4. Add index for performance on large databases
CREATE INDEX IF NOT EXISTS idx_purchases_producer_id ON purchases (producer_id);