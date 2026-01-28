
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

const tablesToCheck = [
  'profiles',
  'producers',
  'beats',
  'merch_products',
  'stores',
  'orders',
  'newsletters',
  'artist_questionnaires',
  'articles',
  'artist_profiles_ext',
  'charts',
  'submissions',
  'pulse_data',
  'distribution_data'
];

async function diagnose() {
  console.log('--- Comprehensive Table Check ---');
  
  for (const table of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0); // Only check if table exists
        
      if (error) {
        if (error.code === 'PGRST205') {
          console.log(`❌ ${table}: MISSING (PGRST205)`);
        } else {
          console.log(`⚠️ ${table}: ERROR (${error.code}) - ${error.message}`);
        }
      } else {
        console.log(`✅ ${table}: EXISTS`);
      }
    } catch (e) {
      console.log(`🔥 ${table}: EXCEPTION - ${e.message}`);
    }
  }
}

diagnose();
