-- Core Profiles & Auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'artist' CHECK (role IN ('admin', 'producer', 'artist')),
  display_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'verified', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN new.raw_user_meta_data->>'role' IN ('artist', 'producer', 'admin') THEN new.raw_user_meta_data->>'role'
      ELSE 'artist'
    END
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ROW LEVEL SECURITY (RLS)

-- Profiles: Users can only read/write their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR
SELECT USING (auth.uid () = id);

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

-- Producers: Producers can only manage their own producer profile
ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers can view own record" ON producers FOR
SELECT USING (auth.uid () = profile_id);

CREATE POLICY "Producers can update own record" ON producers FOR
UPDATE USING (auth.uid () = profile_id);

CREATE POLICY "Public can view active producer info" ON producers FOR
SELECT USING (status = 'active');

-- Merch: Producers manage own products, public can view published
ALTER TABLE merch_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers manage own merch" ON merch_products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM producers
        WHERE
            producers.id = merch_products.producer_id
            AND producers.profile_id = auth.uid ()
    )
);

CREATE POLICY "Public can view published merch" ON merch_products FOR
SELECT USING (status = 'published');

-- Orders: Producers manage own orders, customers (if authed) view own via email
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Producers view own orders" ON orders FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM producers
            WHERE
                producers.id = orders.producer_id
                AND producers.profile_id = auth.uid ()
        )
    );