
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase URL or Service Role Key');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  console.log('Attempting to create debug user via Admin API...');

  const email = 'debug_invite@example.com';
  const password = 'password123';
  const role = 'customer';
  const displayName = 'Debug User';

  // 1. Delete if exists (cleanup from previous failed attempts if any ghost data)
  // Actually, we can't easily delete by email if auth creation failed, but let's list to check.
  const { data: listData } = await supabase.auth.admin.listUsers();
  const existing = listData.users.find(u => u.email === email);
  if (existing) {
      console.log(`User ${email} already exists (ID: ${existing.id}). Deleting to retry...`);
      await supabase.auth.admin.deleteUser(existing.id);
      console.log('Deleted.');
  }

  // 2. Create
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      role: role
    }
  });

  if (createError) {
    console.error('❌ Failed to create user:', createError);
  } else {
    console.log('✅ User created successfully:', newUser.user.id);
  }
}

run();
