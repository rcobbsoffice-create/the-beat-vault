
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Checking beats table schema...');
  const { data, error } = await supabase.from('beats').select('*').limit(1);
  if (error) {
      console.error('Error:', error);
  } else {
      console.log('Success. Data keys:', data[0] ? Object.keys(data[0]) : 'No data');
  }
}

run();
