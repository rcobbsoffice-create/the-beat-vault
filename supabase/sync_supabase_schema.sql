-- =====================================================
-- 🚨 FINAL RESCUE SCRIPT: MISSING PIECES ONLY 🚨
-- =====================================================
-- My audit shows that your BEATS and FINGERPRINT tables
-- are now perfect, but these specific pieces below failed.
--
-- PLEASE RUN THIS AND COPY ANY ERROR MESSAGE
-- FROM THE SUPABASE CONSOLE IF IT FAILS!
-- =====================================================

-- 1. FIX PURCHASES TABLE (CRITICAL)
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS producer_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

UPDATE public.purchases p
SET
    producer_id = b.producer_id
FROM public.beats b
WHERE
    p.beat_id = b.id
    AND p.producer_id IS NULL;

-- 2. CREATE MISSING UTILITY TABLES
CREATE TABLE IF NOT EXISTS public.download_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.beat_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES public.beats(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  plays INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  favorites INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(beat_id, date)
);

CREATE TABLE IF NOT EXISTS public.dsp_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  dsp TEXT NOT NULL,
  credentials JSONB NOT NULL DEFAULT '{}'::jsonb,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked')),
  UNIQUE(user_id, dsp)
);

-- 3. ENABLE RLS
ALTER TABLE public.download_tokens ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.beat_daily_stats ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.dsp_credentials ENABLE ROW LEVEL SECURITY;

-- 4. RE-APPLY PURCHASE POLICY
DROP POLICY IF EXISTS "Producers can view purchases of their beats" ON public.purchases;

CREATE POLICY "Producers can view purchases of their beats" ON public.purchases FOR
SELECT USING (auth.uid () = producer_id);