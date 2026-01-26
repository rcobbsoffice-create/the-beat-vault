
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
  const rolesToTest = ['artist', 'producer', 'admin', 'user', 'guest'];
  console.log('Testing allowed roles for profiles...');

  for (const role of rolesToTest) {
      const fakeId = crypto.randomUUID();
      const testData = {
          id: fakeId,
          email: `test_${role}@example.com`,
          role: role
      };

      const { error } = await supabase.from('profiles').insert(testData);

      if (error) {
          console.log(`❌ Role "${role}" FAILED: ${error.message}`);
      } else {
          console.log(`✅ Role "${role}" SUCCEEDED!`);
          // Cleanup
          await supabase.from('profiles').delete().eq('id', fakeId);
      }
  }
}

run();
