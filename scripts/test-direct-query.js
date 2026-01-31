const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDirectQuery() {
    // Create a fresh client
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    );

    const beatId = 'bf6a1da5-d348-4d43-a659-dc349653d1f1';
    
    console.log('Querying beat with fresh client...\n');
    
    const { data: beat, error } = await supabase
        .from('beats')
        .select('id, title, audio_url')
        .eq('id', beatId)
        .single();
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    console.log('Beat ID:', beat.id);
    console.log('Title:', beat.title);
    console.log('Audio URL:', beat.audio_url);
    console.log('\nURL domain:', beat.audio_url.split('/').slice(0, 3).join('/'));
}

testDirectQuery();
