-- Merch Command Center & Store Setup Migration

-- 1. Add printful_store_id to producers if missing
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='producers' AND column_name='printful_store_id') THEN
    ALTER TABLE producers ADD COLUMN printful_store_id TEXT;
  END IF;
END $$;

-- 2. Create Artists Table (parallel to producers but for artists)
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  printful_store_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ensure supplier_product_id is unique on merch_products
DO $$ 
BEGIN 
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='merch_products') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.constraint_column_usage WHERE table_name = 'merch_products' AND constraint_name = 'merch_products_supplier_product_id_key') THEN
      ALTER TABLE merch_products ADD CONSTRAINT merch_products_supplier_product_id_key UNIQUE (supplier_product_id);
    END IF;
  END IF;
END $$;

-- 3. RLS for Artists and Merch
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all artists" ON artists FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- Ensure Admins can manage all merch
CREATE POLICY "Admins manage all merch" ON merch_products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "Artists can view own record" ON artists;

CREATE POLICY "Artists can view own record" ON artists FOR
SELECT USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Artists can update own record" ON artists;

CREATE POLICY "Artists can update own record" ON artists FOR
UPDATE USING (auth.uid () = profile_id);

-- 4. Unified handle_new_user trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_role TEXT;
  v_display_name TEXT;
BEGIN
  v_role := CASE 
    WHEN new.raw_user_meta_data->>'role' IN ('artist', 'producer', 'admin') THEN new.raw_user_meta_data->>'role'
    ELSE 'artist'
  END;
  
  v_display_name := COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1));

  -- Insert into profiles
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (new.id, new.email, v_display_name, v_role)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role;

  -- Handle Producer Role
  IF (v_role = 'producer') THEN
    INSERT INTO public.producers (profile_id, store_slug)
    VALUES (new.id, LOWER(REPLACE(v_display_name, ' ', '-')))
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  -- Handle Artist Role
  IF (v_role = 'artist') THEN
    INSERT INTO public.artists (profile_id)
    VALUES (new.id)
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;

  -- Note: Store creation at Printful will be handled via a 
  -- separate service or edge function call after signup
  -- to avoid blocking the auth transaction.

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger if needed (usually handled by schema.sql)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();