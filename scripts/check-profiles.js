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

async function checkProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'producer')
    .limit(1);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log('Producer Profile:', JSON.stringify(data[0], null, 2));
}

checkProfiles();
