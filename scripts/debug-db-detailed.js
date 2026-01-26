
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
  console.log('Checking producers table...');
  const { data: producer, error: prodError } = await supabase
    .from('producers')
    .select('*')
    .limit(1);

  if (prodError) {
      console.error('❌ Producer Select Error:', prodError);
  } else {
      console.log('✅ Producer Select Success. First row:', producer);
  }

  console.log('\nChecking all columns in profiles...');
  // We can't easily query information_schema via RPC/PostgREST unless it's exposed.
  // But we can try to insert a record with a non-existent FK to see the error message which might list columns.
  
  const fakeId = '00000000-0000-0000-0000-000000000000'; // Likely to fail FK check
  const { error: insError } = await supabase
    .from('profiles')
    .insert({ id: fakeId, email: 'test@example.com' });

  if (insError) {
      console.log('Expected Insert Error (Profiles):', insError.message, insError.details, insError.hint);
  }

  const { error: insErrorProd } = await supabase
    .from('producers')
    .insert({ profile_id: fakeId, store_slug: 'test-slug' });

  if (insErrorProd) {
      console.log('Expected Insert Error (Producers):', insErrorProd.message, insErrorProd.details, insErrorProd.hint);
  }
}

run();
