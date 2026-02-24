-- Fix RLS Policies for Storefront Initialization

-- 1. Ensure RLS is enabled
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts/duplicates
DROP POLICY IF EXISTS "Users can insert their own producer profile" ON producers;

DROP POLICY IF EXISTS "Users can update their own producer profile" ON producers;

DROP POLICY IF EXISTS "Producers are viewable by everyone" ON producers;

DROP POLICY IF EXISTS "Producers can create their own store" ON stores;

DROP POLICY IF EXISTS "Producers can update their own store" ON stores;

DROP POLICY IF EXISTS "Stores are viewable by everyone" ON stores;

-- 3. Create Producers Policies
CREATE POLICY "Users can insert their own producer profile" ON producers FOR
INSERT
WITH
    CHECK (auth.uid () = profile_id);

CREATE POLICY "Users can update their own producer profile" ON producers FOR
UPDATE USING (auth.uid () = profile_id);

CREATE POLICY "Producers are viewable by everyone" ON producers FOR
SELECT USING (true);

-- 4. Create Stores Policies
-- Allow a user to create a store if they are the producer linked to it
CREATE POLICY "Producers can create their own store" ON stores FOR
INSERT
WITH
    CHECK (
        EXISTS (
            SELECT 1
            FROM producers
            WHERE
                id = producer_id
                AND profile_id = auth.uid ()
        )
    );

-- Allow a user to update their store if they are the producer linked to it
CREATE POLICY "Producers can update their own store" ON stores FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM producers
        WHERE
            id = producer_id
            AND profile_id = auth.uid ()
    )
);

CREATE POLICY "Stores are viewable by everyone" ON stores FOR
SELECT USING (true);