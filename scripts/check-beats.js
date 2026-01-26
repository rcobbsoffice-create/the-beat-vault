const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkBeats() {
  const { data, count, error } = await supabase
    .from('beats')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching beats:', error);
    return;
  }

  console.log('Total beats in DB:', count);
  if (data && data.length > 0) {
     console.log('First beat ID:', data[0].id);
     console.log('Sample beat producer_id:', data[0].producer_id);
  }
}

checkBeats();
