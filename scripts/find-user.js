const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findUser() {
  const producerId = 'f47aac02-ea2e-464c-878e-735597963e72';
  
  // Try profiles table first
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', producerId)
    .single();

  if (profileError) {
    console.error('Error fetching profile:', profileError);
  } else {
    console.log('Profile Data (including email if present):', profile);
  }

  // Also try auth.admin just in case it was just slow
  try {
      const { data: { user }, error: authError } = await supabase.auth.admin.getUserById(producerId);
      if (authError) {
          console.error('Auth Admin Error:', authError);
      } else {
          console.log('Auth Email:', user.email);
      }
  } catch (e) {
      console.error('Auth Exception:', e);
  }
}

findUser();
