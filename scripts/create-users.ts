
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
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

const users = [
  {
    email: 'admin@thebeatvault.com',
    password: 'password123',
    role: 'admin',
    displayName: 'Admin User'
  },
  {
    email: 'producer@thebeatvault.com',
    password: 'password123',
    role: 'producer',
    displayName: 'Top Producer'
  },
  {
    email: 'artist@thebeatvault.com',
    password: 'password123',
    role: 'artist',
    displayName: 'Rising Artist'
  }
];

async function run() {
  console.log('🚀 Starting Robust User & Profile Sync...');

  for (const user of users) {
    let userId = '';

    // 1. Try to create Auth User
    const { data: createData, error: createError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        display_name: user.displayName,
        role: user.role
      }
    });

    if (createData.user) {
      userId = createData.user.id;
      console.log(`✅ Created Auth for: ${user.email}`);
    } else if (createError?.message?.includes('already been registered')) {
        // Find existing user ID
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error(`❌ Error listing users for ${user.email}:`, listError);
          continue;
        }
        const existing = listData.users.find(u => u.email === user.email);
        if (existing) {
          userId = existing.id;
          console.log(`ℹ️ Auth exists for: ${user.email}, proceeding to Profile update.`);
        }
    } else {
      console.error(`❌ Unexpected error creating ${user.email}:`, createError);
      continue;
    }

    if (!userId) {
      console.error(`❌ Could not determine User ID for ${user.email}`);
      continue;
    }

    // 2. Ensure Public Profile exists
    const { data: profile, error: profileGetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileGetError && profileGetError.code !== 'PGRST116') {
       console.error(`❌ Error checking profile for ${user.email}:`, profileGetError);
       continue;
    }

    if (!profile) {
      console.log(`✨ Backfilling profile for: ${user.email}`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          role: user.role,
          display_name: user.displayName,
          avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${user.displayName}`,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error(`❌ Failed to insert profile for ${user.email}:`, insertError);
      } else {
        console.log(`✅ Profile created successfully for ${user.email}`);
      }
    } else {
      console.log(`ℹ️ Profile already exists for: ${user.email}`);
    }
  }

  console.log('\n🎉 Sync Complete!');
}

run();
