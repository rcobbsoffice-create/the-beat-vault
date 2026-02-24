-- =====================================================
-- AUDIOGENES - COMPLETE RLS POLICIES
-- =====================================================
-- Row Level Security policies for all tables
-- Execute AFTER running complete_schema.sql
-- =====================================================

-- =====================================================
-- 1. PROFILES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can update own profile" ON profiles FOR
UPDATE USING (auth.uid () = id);

DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

CREATE POLICY "Admins can update any profile" ON profiles FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 2. PRODUCERS
-- =====================================================

ALTER TABLE producers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active producers" ON producers;

CREATE POLICY "Public can view active producers" ON producers FOR
SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Producers can view own record" ON producers;

CREATE POLICY "Producers can view own record" ON producers FOR
SELECT USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Producers can update own record" ON producers;

CREATE POLICY "Producers can update own record" ON producers FOR
UPDATE USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Producers can insert own record" ON producers;

CREATE POLICY "Producers can insert own record" ON producers FOR
INSERT
WITH
    CHECK (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Admins can manage all producers" ON producers;

CREATE POLICY "Admins can manage all producers" ON producers FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 3. STORES
-- =====================================================

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view stores" ON stores;

CREATE POLICY "Public can view stores" ON stores FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM producers
            WHERE
                producers.id = stores.producer_id
                AND producers.status = 'active'
        )
    );

DROP POLICY IF EXISTS "Producers can manage own store" ON stores;

CREATE POLICY "Producers can manage own store" ON stores FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM producers
        WHERE
            producers.id = stores.producer_id
            AND producers.profile_id = auth.uid ()
    )
);

-- =====================================================
-- 4. GENRE SETTINGS
-- =====================================================

ALTER TABLE genre_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view approved genres" ON genre_settings;

CREATE POLICY "Everyone can view approved genres" ON genre_settings FOR
SELECT USING (status = 'approved');

DROP POLICY IF EXISTS "Authenticated users can propose genres" ON genre_settings;

CREATE POLICY "Authenticated users can propose genres" ON genre_settings FOR
INSERT
WITH
    CHECK (
        auth.uid () IS NOT NULL
        AND status = 'proposed'
    );

DROP POLICY IF EXISTS "Admins can manage all genres" ON genre_settings;

CREATE POLICY "Admins can manage all genres" ON genre_settings FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 5. BEATS
-- =====================================================

ALTER TABLE beats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published beats" ON beats;

CREATE POLICY "Public can view published beats" ON beats FOR
SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Producers can view own beats" ON beats;

CREATE POLICY "Producers can view own beats" ON beats FOR
SELECT USING (auth.uid () = producer_id);

DROP POLICY IF EXISTS "Producers can create own beats" ON beats;

CREATE POLICY "Producers can create own beats" ON beats FOR
INSERT
WITH
    CHECK (auth.uid () = producer_id);

DROP POLICY IF EXISTS "Producers can update own beats" ON beats;

CREATE POLICY "Producers can update own beats" ON beats FOR
UPDATE USING (auth.uid () = producer_id);

DROP POLICY IF EXISTS "Producers can delete own beats" ON beats;

CREATE POLICY "Producers can delete own beats" ON beats FOR DELETE USING (auth.uid () = producer_id);

DROP POLICY IF EXISTS "Admins can manage all beats" ON beats;

CREATE POLICY "Admins can manage all beats" ON beats FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 6. LICENSES
-- =====================================================

ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active licenses" ON licenses;

CREATE POLICY "Public can view active licenses" ON licenses FOR
SELECT USING (
        is_active = true
        AND EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = licenses.beat_id
                AND beats.status = 'published'
        )
    );

DROP POLICY IF EXISTS "Producers can manage own beat licenses" ON licenses;

CREATE POLICY "Producers can manage own beat licenses" ON licenses FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM beats
        WHERE
            beats.id = licenses.beat_id
            AND beats.producer_id = auth.uid ()
    )
);

DROP POLICY IF EXISTS "Admins can manage all licenses" ON licenses;

CREATE POLICY "Admins can manage all licenses" ON licenses FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 7. BEAT FAVORITES
-- =====================================================

ALTER TABLE beat_favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own favorites" ON beat_favorites;

CREATE POLICY "Users can view own favorites" ON beat_favorites FOR
SELECT USING (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can add favorites" ON beat_favorites;

CREATE POLICY "Users can add favorites" ON beat_favorites FOR
INSERT
WITH
    CHECK (auth.uid () = user_id);

DROP POLICY IF EXISTS "Users can remove own favorites" ON beat_favorites;

CREATE POLICY "Users can remove own favorites" ON beat_favorites FOR DELETE USING (auth.uid () = user_id);

-- =====================================================
-- 8. PURCHASES
-- =====================================================

ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Buyers can view own purchases" ON purchases;

CREATE POLICY "Buyers can view own purchases" ON purchases FOR
SELECT USING (auth.uid () = buyer_id);

DROP POLICY IF EXISTS "Producers can view purchases of their beats" ON purchases;

CREATE POLICY "Producers can view purchases of their beats" ON purchases FOR
SELECT USING (auth.uid () = producer_id);

DROP POLICY IF EXISTS "System can create purchases" ON purchases;

CREATE POLICY "System can create purchases" ON purchases FOR
INSERT
WITH
    CHECK (true);
-- Purchases created via Edge Functions

DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;

CREATE POLICY "Admins can view all purchases" ON purchases FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- =====================================================
-- 9. MERCH PRODUCTS
-- =====================================================

ALTER TABLE merch_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published merch" ON merch_products;

CREATE POLICY "Public can view published merch" ON merch_products FOR
SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Producers manage own merch" ON merch_products;

CREATE POLICY "Producers manage own merch" ON merch_products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM producers
        WHERE
            producers.id = merch_products.producer_id
            AND producers.profile_id = auth.uid ()
    )
);

DROP POLICY IF EXISTS "Admins manage all merch" ON merch_products;

CREATE POLICY "Admins manage all merch" ON merch_products FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 10. ORDERS
-- =====================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Producers view own orders" ON orders;

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

DROP POLICY IF EXISTS "System can create orders" ON orders;

CREATE POLICY "System can create orders" ON orders FOR
INSERT
WITH
    CHECK (true);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;

CREATE POLICY "Admins can view all orders" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 11. ARTISTS
-- =====================================================

ALTER TABLE artists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified artists" ON artists;

CREATE POLICY "Public can view verified artists" ON artists FOR
SELECT USING (verified = true);

DROP POLICY IF EXISTS "Artists can view own profile" ON artists;

CREATE POLICY "Artists can view own profile" ON artists FOR
SELECT USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Artists can update own profile" ON artists;

CREATE POLICY "Artists can update own profile" ON artists FOR ALL USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Admins can manage all artists" ON artists;

CREATE POLICY "Admins can manage all artists" ON artists FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 12. ARTIST PROFILES EXTENDED
-- =====================================================

ALTER TABLE artist_profiles_ext ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view verified artist profiles" ON artist_profiles_ext;

CREATE POLICY "Public can view verified artist profiles" ON artist_profiles_ext FOR
SELECT USING (is_verified = true);

DROP POLICY IF EXISTS "Artists can view own profile ext" ON artist_profiles_ext;

CREATE POLICY "Artists can view own profile ext" ON artist_profiles_ext FOR
SELECT USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Artists can manage own profile ext" ON artist_profiles_ext;

CREATE POLICY "Artists can manage own profile ext" ON artist_profiles_ext FOR ALL USING (auth.uid () = profile_id);

DROP POLICY IF EXISTS "Admins can manage all artist profiles ext" ON artist_profiles_ext;

CREATE POLICY "Admins can manage all artist profiles ext" ON artist_profiles_ext FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 13. ARTIST QUESTIONNAIRES
-- =====================================================

ALTER TABLE artist_questionnaires ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own questionnaires" ON artist_questionnaires;

CREATE POLICY "Users can manage own questionnaires" ON artist_questionnaires FOR ALL USING (auth.uid () = artist_id);

DROP POLICY IF EXISTS "Admins and Editors view all questionnaires" ON artist_questionnaires;

CREATE POLICY "Admins and Editors view all questionnaires" ON artist_questionnaires FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role IN ('admin', 'editor')
        )
    );

DROP POLICY IF EXISTS "Admins and Editors update questionnaires" ON artist_questionnaires;

CREATE POLICY "Admins and Editors update questionnaires" ON artist_questionnaires FOR
UPDATE USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('admin', 'editor')
    )
);

-- =====================================================
-- 14. SUBMISSIONS
-- =====================================================

ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Artists can view own submissions" ON submissions;

CREATE POLICY "Artists can view own submissions" ON submissions FOR
SELECT USING (auth.uid () = artist_id);

DROP POLICY IF EXISTS "Artists can create submissions" ON submissions;

CREATE POLICY "Artists can create submissions" ON submissions FOR
INSERT
WITH
    CHECK (auth.uid () = artist_id);

DROP POLICY IF EXISTS "Admins can manage all submissions" ON submissions;

CREATE POLICY "Admins can manage all submissions" ON submissions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 15. DISTRIBUTION DATA
-- =====================================================

ALTER TABLE distribution_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view all distribution data" ON distribution_data;

CREATE POLICY "Admins view all distribution data" ON distribution_data FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Artists view own distribution data" ON distribution_data;

CREATE POLICY "Artists view own distribution data" ON distribution_data FOR
SELECT USING (auth.uid () = artist_id);

DROP POLICY IF EXISTS "System can manage distribution data" ON distribution_data;

CREATE POLICY "System can manage distribution data" ON distribution_data FOR ALL
WITH
    CHECK (true);
-- Managed by Edge Functions

-- =====================================================
-- 16. ARTICLES
-- =====================================================

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published articles" ON articles;

CREATE POLICY "Public can view published articles" ON articles FOR
SELECT USING (status = 'published');

DROP POLICY IF EXISTS "Authors can view own articles" ON articles;

CREATE POLICY "Authors can view own articles" ON articles FOR
SELECT USING (auth.uid () = author_id);

DROP POLICY IF EXISTS "Admins and Editors can manage articles" ON articles;

CREATE POLICY "Admins and Editors can manage articles" ON articles FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role IN ('admin', 'editor')
    )
);

-- =====================================================
-- 17. CHARTS
-- =====================================================

ALTER TABLE charts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Charts are viewable by everyone" ON charts;

CREATE POLICY "Charts are viewable by everyone" ON charts FOR
SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage charts" ON charts;

CREATE POLICY "Admins can manage charts" ON charts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 18. NEWSLETTERS
-- =====================================================

ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage newsletters" ON newsletters;

CREATE POLICY "Admins can manage newsletters" ON newsletters FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 19. CONTACTS
-- =====================================================

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage contacts" ON contacts;

CREATE POLICY "Admins can manage contacts" ON contacts FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

-- =====================================================
-- 20. AUDIO FINGERPRINTS
-- =====================================================

ALTER TABLE audio_fingerprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Producers can view own beat fingerprints" ON audio_fingerprints;

CREATE POLICY "Producers can view own beat fingerprints" ON audio_fingerprints FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = audio_fingerprints.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all fingerprints" ON audio_fingerprints;

CREATE POLICY "Admins can manage all fingerprints" ON audio_fingerprints FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "System can manage fingerprints" ON audio_fingerprints;

CREATE POLICY "System can manage fingerprints" ON audio_fingerprints FOR ALL
WITH
    CHECK (true);
-- Managed by Edge Functions

-- =====================================================
-- 21. TRACK DETECTIONS
-- =====================================================

ALTER TABLE track_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Producers can view own beat detections" ON track_detections;

CREATE POLICY "Producers can view own beat detections" ON track_detections FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = track_detections.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Admins can manage all detections" ON track_detections;

CREATE POLICY "Admins can manage all detections" ON track_detections FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM profiles
        WHERE
            id = auth.uid ()
            AND role = 'admin'
    )
);

DROP POLICY IF EXISTS "System can manage detections" ON track_detections;

CREATE POLICY "System can manage detections" ON track_detections FOR ALL
WITH
    CHECK (true);
-- Managed by Edge Functions

-- =====================================================
-- 22. BEAT TRACKING SUMMARY
-- =====================================================

ALTER TABLE beat_tracking_summary ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Producers can view own beat tracking" ON beat_tracking_summary;

CREATE POLICY "Producers can view own beat tracking" ON beat_tracking_summary FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = beat_tracking_summary.beat_id
                AND beats.producer_id = auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Admins can view all tracking summaries" ON beat_tracking_summary;

CREATE POLICY "Admins can view all tracking summaries" ON beat_tracking_summary FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- =====================================================
-- 23. ANALYTICS EVENTS
-- =====================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "System can insert analytics" ON analytics_events;

CREATE POLICY "System can insert analytics" ON analytics_events FOR
INSERT
WITH
    CHECK (true);

DROP POLICY IF EXISTS "Admins can view all analytics" ON analytics_events;

CREATE POLICY "Admins can view all analytics" ON analytics_events FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- =====================================================
-- 24. ADMIN ANALYTICS TABLES
-- =====================================================

ALTER TABLE admin_fingerprint_global_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view global stats" ON admin_fingerprint_global_stats;

CREATE POLICY "Admins can view global stats" ON admin_fingerprint_global_stats FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

ALTER TABLE admin_fingerprint_platform_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view platform stats" ON admin_fingerprint_platform_stats;

CREATE POLICY "Admins can view platform stats" ON admin_fingerprint_platform_stats FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM profiles
            WHERE
                id = auth.uid ()
                AND role = 'admin'
        )
    );

-- =====================================================
-- 25. PULSE DATA
-- =====================================================

ALTER TABLE pulse_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view pulse data for published beats" ON pulse_data;

CREATE POLICY "Public can view pulse data for published beats" ON pulse_data FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM beats
            WHERE
                beats.id = pulse_data.beat_id
                AND beats.status = 'published'
        )
    );

DROP POLICY IF EXISTS "System can manage pulse data" ON pulse_data;

CREATE POLICY "System can manage pulse data" ON pulse_data FOR ALL
WITH
    CHECK (true);
-- Managed by Edge Functions

-- =====================================================
-- END OF RLS POLICIES
-- =====================================================