
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkColumns() {
  const tables = ['orders', 'producers', 'beats', 'stores'];
  
  for (const table of tables) {
    console.log(`\n--- Checking ${table} ---`);
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.error(`Error fetching from ${table}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Columns for ${table}:`, Object.keys(data[0]));
    } else {
      console.log(`No data in ${table}, but table exists.`);
    }
  }
}

checkColumns();
