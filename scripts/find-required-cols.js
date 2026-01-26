
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
  const fakeId = crypto.randomUUID();
  console.log('Testing column requirements for profiles with clean insert...');

  // We already know 'role' is NOT NULL. 
  // Let's try to find other hidden required columns by adding columns one by one.
  // Current knowns: id, email, role, created_at, updated_at, status
  
  const testData = {
      id: fakeId,
      email: 'test_meta@example.com',
      role: 'customer'
  };

  const { error } = await supabase.from('profiles').insert(testData);

  if (error) {
      console.log('❌ Insert Error:', error.message);
      console.log('Details:', error.details);
  } else {
      console.log('✅ Success! (id, email, role) are sufficient.');
  }
}

run();
