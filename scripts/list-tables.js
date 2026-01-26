const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function parseEnv(path) {
  const content = fs.readFileSync(path, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim();
    }
  });
  return env;
}

const env = parseEnv('.env.local');
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('Listing tables...');
  const { data, error } = await supabase
    .rpc('get_tables'); // If rpc exists
  
  if (error) {
    // Fallback to direct query if rpc doesn't exist (might fail due to permissions)
    const { data: tables, error: tablesError } = await supabase
      .from('beats') // try to select from a known table to see if it works
      .select('*')
      .limit(1);
    
    if (tablesError) {
       console.error('Error:', tablesError);
    } else {
       console.log('beats table exists');
    }
  } else {
    console.table(data);
  }
}

listTables();
