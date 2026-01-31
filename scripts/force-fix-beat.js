const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function forceUpdate() {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const beatId = 'bf6a1da5-d348-4d43-a659-dc349653d1f1';
   const newAudioUrl = 'https://pub-42ddce115e0f4aa28de06c4abaeed76a.r2.dev/beats/90851a87-254f-4ee2-a6fd-2d3d8049b3dd/3968a53b-93af-4774-80aa-cd6e4c91288b/original/Finish line.mp3';
    const newArtworkUrl = 'https://pub-42ddce115e0f4aa28de06c4abaeed76a.r2.dev/beats/90851a87-254f-4ee2-a6fd-2d3d8049b3dd/1bf5cb35-5323-4dfe-95f8-0a49ac7ab442/artwork/dna-3539309.jpg';

    console.log(`\nForce updating beat ${beatId}...\n`);

    const { data, error } = await supabase
        .from('beats')
        .update({
            audio_url: newAudioUrl,
            artwork_url: newArtworkUrl
        })
        .eq('id', beatId)
        .select();

    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('✅ Updated successfully!');
        console.log('New audio_url:', data[0].audio_url);
        console.log('New artwork_url:', data[0].artwork_url);
    }
}

forceUpdate();
