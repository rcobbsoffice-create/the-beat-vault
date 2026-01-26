
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Testing direct insert to profiles...');
  
  const fakeId = crypto.randomUUID();
  console.log('Fake ID:', fakeId);

  // Note: profiles.id foreign key references auth.users. 
  // We cannot insert into profiles unless the User ID exists in auth.users!
  // BUT the trigger is supposed to do this atomically.
  // Testing direct insert into profiles will FAIL with Foreign Key Violation if user doesn't exist.
  
  // So first, let's try to just select from profiles to see if we have access.
  const { data: selectData, error: selectError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);

  if (selectError) {
      console.error('❌ Select Error:', selectError);
  } else {
      console.log('✅ Select Success. First row:', selectData);
  }
}

run();
