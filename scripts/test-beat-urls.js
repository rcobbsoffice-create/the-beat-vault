const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testBeatUrls() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: beat, error } = await supabase
        .from('beats')
        .select('id, title, audio_url, artwork_url')
        .eq('id', 'bf6a1da5-d348-4d43-a659-dc349653d1f1')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Beat:', beat.title);
    console.log('\nStored URLs in Database:');
    console.log('Audio URL:', beat.audio_url);
    console.log('Artwork URL:', beat.artwork_url);
    
    console.log('\nAPI Endpoints:');
    console.log('Stream:', `http://localhost:3000/api/beats/${beat.id}/stream`);
    console.log('Artwork:', `http://localhost:3000/api/beats/${beat.id}/artwork`);
    
    console.log('\nExpected R2 Domain:', process.env.NEXT_PUBLIC_R2_PUBLIC_URL);
}

testBeatUrls();
