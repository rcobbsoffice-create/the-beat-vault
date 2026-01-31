
        const { createClient } = require('@supabase/supabase-js');
        require('dotenv').config({ path: '.env.local' });

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

        async function checkBeats() {
            const { data, error } = await supabase
                .from('beats')
                .select('id, title, audio_url, artwork_url, stems_url, producer_id')
                .order('created_at', { ascending: false })
                .limit(5);
                
            if (error) {
                console.error('Error fetching beats:', error);
            } else {
                console.log('Recent Beats:', JSON.stringify(data, null, 2));
            }
        }

        checkBeats();
