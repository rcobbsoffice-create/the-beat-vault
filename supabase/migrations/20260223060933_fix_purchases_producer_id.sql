-- FINAL RESCUE: FIX PURCHASES TABLE
ALTER TABLE public.purchases
ADD COLUMN IF NOT EXISTS producer_id UUID REFERENCES public.profiles (id) ON DELETE SET NULL;

UPDATE public.purchases p
SET
    producer_id = b.producer_id
FROM public.beats b
WHERE
    p.beat_id = b.id
    AND p.producer_id IS NULL;

-- RE-APPLY PURCHASE POLICY
DROP POLICY IF EXISTS "Producers can view purchases of their beats" ON public.purchases;

CREATE POLICY "Producers can view purchases of their beats" ON public.purchases FOR
SELECT USING (auth.uid () = producer_id);