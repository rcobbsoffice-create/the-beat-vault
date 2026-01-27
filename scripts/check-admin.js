
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkAdmin() {
  console.log('--- Checking for Admin Profiles ---');
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'admin');

  if (pError) {
    console.error('Error fetching admin profiles:', pError.message);
  } else {
    console.log(`Found ${profiles.length} admin profiles.`);
    profiles.forEach(p => {
      console.log(`ID: ${p.id}, Email: ${p.email}, Name: ${p.display_name}, Status: ${p.status}`);
    });
  }

  console.log('\n--- Checking Auth Users Meta ---');
  const { data: { users }, error: uError } = await supabase.auth.admin.listUsers();

  if (uError) {
    console.error('Error listing auth users:', uError.message);
  } else {
    const admins = users.filter(u => u.user_metadata?.role === 'admin');
    console.log(`Found ${admins.length} auth users with admin role in metadata.`);
    admins.forEach(u => {
      console.log(`ID: ${u.id}, Email: ${u.email}, Meta:`, u.user_metadata);
    });
  }
}

checkAdmin();
