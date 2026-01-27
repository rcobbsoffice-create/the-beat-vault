-- Create pulse_data table
CREATE TABLE IF NOT EXISTS public.pulse_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beat_id UUID REFERENCES public.beats(id) ON DELETE CASCADE UNIQUE,
  bpm FLOAT,
  bass_energy FLOAT[], -- Array of energy values per segment
  rms_loudness FLOAT[], -- Array of RMS values per segment
  pulses JSONB, -- Frame-accurate pulse data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.pulse_data ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Producers can manage their own pulse data" ON public.pulse_data;

CREATE POLICY "Producers can manage their own pulse data" ON public.pulse_data FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.beats
        WHERE
            beats.id = pulse_data.beat_id
            AND beats.producer_id = auth.uid ()
    )
);

DROP POLICY IF EXISTS "Public can view pulse data" ON public.pulse_data;

CREATE POLICY "Public can view pulse data" ON public.pulse_data FOR
SELECT USING (true);

-- Create motion_assets bucket (this usually needs to be done via Supabase dashboard or API, but here is the SQL for reference if using extensions)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('motion_assets', 'motion_assets', true) ON CONFLICT (id) DO NOTHING;