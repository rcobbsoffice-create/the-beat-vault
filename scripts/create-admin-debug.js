
const { createClient } = require('@supabase/supabase-js');

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

const adminUser = {
  email: 'admin@thebeatvault.com',
  password: 'password123',
  role: 'admin',
  displayName: 'Admin User'
};

async function run() {
  console.log('Starting Admin User Creation/Update...');

    let userId = '';
    const user = adminUser;

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
      console.log(`Created Auth for: ${user.email}`);
    } else if (createError && createError.message && createError.message.includes('already been registered')) {
        console.log(`User already registered: ${user.email}`);
        // Find existing user ID
        const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
          console.error(`Error listing users:`, listError);
          return;
        }
        const existing = listData.users.find(u => u.email === user.email);
        if (existing) {
          userId = existing.id;
          console.log(`Found existing Auth ID: ${userId}`);
          
          // Sync metadata, reset password, and confirm email for existing user
          const { error: updateAuthError } = await supabase.auth.admin.updateUserById(
            userId,
            { 
              user_metadata: { display_name: user.displayName, role: user.role },
              password: user.password,
              email_confirm: true
            }
          );
          if (updateAuthError) {
            console.error(`Error updating auth metadata for ${user.email}:`, updateAuthError);
          } else {
            console.log(`Synced auth metadata for: ${user.email}`);
          }
        }
    } else {
      console.error(`Unexpected error creating ${user.email}:`, createError);
      return;
    }

    if (!userId) {
      console.error(`Could not determine User ID for ${user.email}`);
      return;
    }

    // 2. Ensure Public Profile exists
    const { data: profile, error: profileGetError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileGetError && profileGetError.code !== 'PGRST116') {
       console.error(`Error checking profile:`, profileGetError);
       return;
    }

    if (!profile) {
      console.log(`Backfilling profile for: ${user.email}`);
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email: user.email,
          role: user.role,
          display_name: user.displayName,
          avatar_url: `https://api.dicebear.com/7.x/shapes/svg?seed=${user.displayName}`,
          created_at: new Date().toISOString(),
          status: 'active'
        });

      if (insertError) {
        console.error(`Failed to insert profile:`, insertError);
      } else {
        console.log(`Profile created successfully.`);
      }
    } else {
      console.log(`Profile already exists. Updating role/status just in case.`);
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin', status: 'active' })
        .eq('id', userId);
        
      if (updateError) {
          console.error("Error updating profile:", updateError);
      } else {
          console.log("Profile updated.");
      }
    }

  console.log('Done!');
}

run();
