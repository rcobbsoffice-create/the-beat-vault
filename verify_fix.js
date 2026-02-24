const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAudit() {
  console.log('--- Supabase Schema Deep Audit ---');
  
  // 1. Check Columns in beats
  const { data: beatCols } = await supabase.rpc('get_table_columns_audit', { t_name: 'beats' });
  console.log('Beats Columns:', beatCols ? beatCols.join(', ') : 'Error or Empty');

  // 2. Check Columns in purchases
  const { data: purchaseCols } = await supabase.rpc('get_table_columns_audit', { t_name: 'purchases' });
  console.log('Purchases Columns:', purchaseCols ? purchaseCols.join(', ') : 'Error or Empty');

  // 3. Check Table Existence
  const tables = [
    'audio_fingerprints', 'track_detections', 'download_tokens', 
    'beat_daily_stats', 'cron_logs', 'email_logs', 
    'processing_jobs', 'dsp_credentials'
  ];
  
  for (const t of tables) {
    const { data: exists } = await supabase.rpc('check_table_exists_audit', { t_name: t });
    console.log(`Table ${t}: ${exists ? 'EXISTS' : 'MISSING'}`);
  }
}

// Since I don't have these RPCs, I'll use a direct SQL approach via a temporary function if I can, 
// OR I'll just use the select method more carefully.
// Actually, I'll just use the select method on information_schema if I have permissions, 
// but Supabase usually restricts this.
// Best way is to just try a SELECT FROM table LIMIT 0 for each.

async function verifySync() {
  console.log('--- Supabase Schema Sync Verification (Attempt 2) ---');
  
  const tablesToCheck = [
    'beats', 'purchases', 'profiles', 'audio_fingerprints', 'track_detections', 
    'download_tokens', 'beat_daily_stats', 'cron_logs', 'email_logs', 
    'processing_jobs', 'dsp_credentials'
  ];

  for (const t of tablesToCheck) {
    const { error } = await supabase.from(t).select('*').limit(0);
    if (error) {
      console.log(`Table ${t}: MISSING (${error.message})`);
    } else {
      console.log(`Table ${t}: EXISTS`);
      
      // If table exists, check specific columns
      if (t === 'beats') {
          const { error: e1 } = await supabase.from(t).select('price').limit(0);
          console.log(`  beats.price: ${e1 ? `MISSING (${e1.message})` : 'EXISTS'}`);
          const { error: e2 } = await supabase.from(t).select('view_count').limit(0);
          console.log(`  beats.view_count: ${e2 ? `MISSING (${e2.message})` : 'EXISTS'}`);
      }
      if (t === 'purchases') {
          const { error: e1 } = await supabase.from(t).select('producer_id').limit(0);
          console.log(`  purchases.producer_id: ${e1 ? `MISSING (${e1.message})` : 'EXISTS'}`);
      }
    }
  }
}

verifySync();
