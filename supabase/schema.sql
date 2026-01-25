-- Core Profiles & Auth
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'producer', 'customer')),
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Producer Profiles
CREATE TABLE producers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  store_slug TEXT UNIQUE NOT NULL,
  branding JSONB DEFAULT '{}'::jsonb,
  stripe_account_id TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'disabled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Storefront Customization
CREATE TABLE stores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE NOT NULL,
  url TEXT,
  theme JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Merchandise Catalog
CREATE TABLE merch_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  supplier TEXT CHECK (supplier IN ('printful', 'printify', 'manual')),
  supplier_product_id TEXT,
  variant_ids JSONB DEFAULT '[]'::jsonb,
  base_cost NUMERIC(10,2),
  retail_price NUMERIC(10,2),
  platform_fee_percent NUMERIC(5,2) DEFAULT 10.00,
  status TEXT DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Intermediate Ideas / AI Pipeline
CREATE TABLE merch_ideas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES producers(id) ON DELETE CASCADE NOT NULL,
  idea_type TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Tracking
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID REFERENCES producers(id) NOT NULL,
  customer_email TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
  fulfillment_status TEXT DEFAULT 'pending' CHECK (fulfillment_status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  tracking_number TEXT,
  total_amount NUMERIC(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AUTH TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'display_name',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );

  -- If producer, create entry
  IF (new.raw_user_meta_data->>'role' = 'producer') THEN
    INSERT INTO public.producers (profile_id, store_slug)
    VALUES (
      new.id,
      LOWER(REPLACE(new.raw_user_meta_data->>'display_name', ' ', '-'))
    );
  END IF;

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