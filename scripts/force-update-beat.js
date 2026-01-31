const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function forceUpdateBeat() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const beatId = 'bf6a1da5-d348-4d43-a659-dc349653d1f1';
    
    // First, let's see what's in the database
    console.log('Fetching current beat data...\n');
    const { data: currentBeat, error: fetchError } = await supabase
        .from('beats')
        .select('id, title, audio_url, artwork_url')
        .eq('id', beatId)
        .single();
    
    if (fetchError) {
        console.error('Error fetching beat:', fetchError);
        return;
    }
    
    console.log('Current URLs in database:');
    console.log('Audio:', currentBeat.audio_url);
    console.log('Artwork:', currentBeat.artwork_url);
    console.log('\n');
    
    // Now update to R2.dev URLs
    const oldDomain = 'https://118d3f495ee79c8de7fe0a297e16b33d.r2.cloudflarestorage.com/beatvault';
    const r2DevDomain = 'https://pub-42ddce115e0f4aa28de06c4abaeed76a.r2.dev';
    
    const newAudioUrl = currentBeat.audio_url.replace(oldDomain, r2DevDomain);
    const newArtworkUrl = currentBeat.artwork_url.replace(oldDomain, r2DevDomain);
    
    console.log('Updating to:');
    console.log('Audio:', newAudioUrl);
    console.log('Artwork:', newArtworkUrl);
    console.log('\n');
    
    const { data, error } = await supabase
        .from('beats')
        .update({
            audio_url: newAudioUrl,
            artwork_url: newArtworkUrl
        })
        .eq('id', beatId)
        .select();
    
    if (error) {
        console.error('❌ Error updating beat:', error);
    } else {
        console.log('✅ Beat updated successfully!');
        console.log('Updated data:', data);
    }
}

forceUpdateBeat();
