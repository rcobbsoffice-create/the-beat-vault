-- Enable RLS on beats if not already
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;

-- 1. Policy for Admins to Delete ANY beat
-- Drop existing policy if it conflicts or just add a new one with a unique name
DROP POLICY IF EXISTS "Admins can delete any beat" ON beats;

CREATE POLICY "Admins can delete any beat" ON beats FOR DELETE USING (
    exists (
        select 1
        from profiles
        where
            profiles.id = auth.uid ()
            and profiles.role = 'admin'
    )
);

-- 2. Policy for Producers to Delete THEIR OWN beats
DROP POLICY IF EXISTS "Producers can delete own beats" ON beats;

CREATE POLICY "Producers can delete own beats" ON beats FOR DELETE USING (auth.uid () = producer_id);

-- Ensure Policies for SELECT/UPDATE/INSERT exist too?
-- Assuming those are fine since "tracks are still showing" implies SELECT works.