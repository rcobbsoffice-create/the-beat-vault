const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function updateToR2Dev() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const { data: beats, error } = await supabase
        .from('beats')
        .select('id, audio_url, artwork_url, stems_url')
        .or('audio_url.like.%cdn.audiogenes.com%,artwork_url.like.%cdn.audiogenes.com%,stems_url.like.%cdn.audiogenes.com%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(`Found ${beats.length} beats to update\n`);

    const oldDomain = 'https://cdn.audiogenes.com';
    const newDomain = 'https://pub-42ddce115e0f4aa28de06c4abaeed76a.r2.dev';

    for (const beat of beats) {
        const updates = {};
        
        if (beat.audio_url && beat.audio_url.includes(oldDomain)) {
            updates.audio_url = beat.audio_url.replace(oldDomain, newDomain);
        }
        
        if (beat.artwork_url && beat.artwork_url.includes(oldDomain)) {
            updates.artwork_url = beat.artwork_url.replace(oldDomain, newDomain);
        }
        
        if (beat.stems_url && beat.stems_url.includes(oldDomain)) {
            updates.stems_url = beat.stems_url.replace(oldDomain, newDomain);
        }

        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('beats')
                .update(updates)
                .eq('id', beat.id);

            if (updateError) {
                console.error(`❌ Failed to update beat ${beat.id}:`, updateError);
            } else {
                console.log(`✅ Updated beat ${beat.id}`);
            }
        }
    }

    console.log('\n✅ Migration complete!');
}

updateToR2Dev();
