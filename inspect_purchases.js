const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectTables() {
  console.log('--- Table Audit ---');
  
  const tables = [
    'beats', 'purchases', 'profiles', 'audio_fingerprints', 
    'track_detections', 'download_tokens', 'beat_daily_stats'
  ];
  
  for (const t of tables) {
    const { error } = await supabase.from(t).select('*').limit(0);
    console.log(`Table ${t}: ${error ? `MISSING (${error.message})` : 'EXISTS'}`);
  }
}

inspectTables();
