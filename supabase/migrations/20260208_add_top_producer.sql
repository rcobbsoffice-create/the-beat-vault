-- Add is_top_producer column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_top_producer BOOLEAN DEFAULT false;

-- Update the Comment for documentation
COMMENT ON COLUMN public.profiles.is_top_producer IS 'Flag to identify producers for the Top Producers section on the marketplace.';

-- Refresh the schema if necessary (Supabase handles this automatically usually)