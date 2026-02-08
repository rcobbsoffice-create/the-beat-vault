-- AUTOMATE MERCH SETUP
-- This script sets up a database trigger to automatically call the Printful store creation logic.

-- 1. Ensure pg_net is enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Automation function
CREATE OR REPLACE FUNCTION public.automate_merch_provisioning()
RETURNS trigger AS $$
BEGIN
  -- Call the Edge Function
  -- Note: Using the project-specific URL and your service role key
  PERFORM
    net.http_post(
      url := 'https://kmvrtcoporkdggtjiero.supabase.co/functions/v1/create-printful-store',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdnJ0Y29wb3JrZGdndGppZXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NzAzOCwiZXhwIjoyMDg0NzIzMDM4fQ.Sv9c0MtkIGJSryRhx1Orm65YWiamCOE199N1xoiZ-QY',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdnJ0Y29wb3JrZGdndGppZXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NzAzOCwiZXhwIjoyMDg0NzIzMDM4fQ.Sv9c0MtkIGJSryRhx1Orm65YWiamCOE199N1xoiZ-QY'
      ),
      body := jsonb_build_object(
        'profile_id', NEW.id,
        'role', NEW.role,
        'display_name', NEW.display_name
      )
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. The Trigger
-- We only trigger this for Artists and Producers
DROP TRIGGER IF EXISTS on_profile_created_merch_automation ON public.profiles;

CREATE TRIGGER on_profile_created_merch_automation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role IN ('artist', 'producer'))
  EXECUTE PROCEDURE public.automate_merch_provisioning();