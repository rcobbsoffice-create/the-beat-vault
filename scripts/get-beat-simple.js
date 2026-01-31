
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://kmvrtcoporkdggtjiero.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttdnJ0Y29wb3JrZGdndGppZXJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTE0NzAzOCwiZXhwIjoyMDg0NzIzMDM4fQ.Sv9c0MtkIGJSryRhx1Orm65YWiamCOE199N1xoiZ-QY'
);

async function main() {
  const { data, error } = await supabase
    .from('beats')
    .select('id, title, preview_url')
    .limit(1)
    .single();

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Beat ID:', data.id);
  console.log('Title:', data.title);
  console.log('Preview URL:', data.preview_url);
}

main();
