
        const { createClient } = require('@supabase/supabase-js');
        require('dotenv').config({ path: '.env.local' });

        const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

        async function checkColumns() {
            const { data, error } = await supabase
                .rpc('get_columns', { table_name: 'beats' });
                
            if (error) {
                // If RPC fails (likely), try direct query if possible or just assume missing if I can't check
                console.error('RPC Error:', error);
                
                // Fallback: Try a select * limit 1 and see keys
                const { data: beats, error: selectError } = await supabase
                    .from('beats')
                    .select('*')
                    .limit(1);
                    
                if (selectError) {
                     console.error('Select Error:', selectError);
                } else if (beats && beats.length > 0) {
                    console.log('Existing columns:', Object.keys(beats[0]));
                } else {
                    console.log('No beats found to infer columns.');
                }
            } else {
                console.log('Columns:', data);
            }
        }

        checkColumns();
