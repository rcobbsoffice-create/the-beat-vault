import { renderMedia, selectComposition } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function renderMotion(beatId: string) {
  console.log(`[Renderer] Starting render for beat: ${beatId}`);

  // 1. Fetch Pulse Data
  const { data: pulseData, error: pulseError } = await supabase
    .from('pulse_data')
    .select('*, beats(*)')
    .eq('beat_id', beatId)
    .single();

  if (pulseError || !pulseData) {
    console.error('Error fetching pulse data:', pulseError);
    return;
  }

  const { beats: beat } = pulseData;

  // 2. Bundling and Selection
  console.log('[Renderer] Bundling Remotion project...');
  const entry = path.resolve('remotion/src/index.tsx');
  const bundleLocation = await bundle(entry);

  const inputProps = {
    pulseData: pulseData.bass_energy,
    albumArtUrl: beat.artwork_url || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=1000&auto=format&fit=crop',
    title: beat.title,
    producerName: 'AudioGenes Artist',
  };

  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'MotionArtwork',
    inputProps,
    timeoutInMilliseconds: 60000, // 60 seconds
  });

  // 3. Render MP4
  const outputDir = path.resolve('public/temp');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputLocation = path.join(outputDir, `motion_${beatId}.mp4`);
  
  console.log('[Renderer] Rendering MP4...');
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    audioCodec: undefined, // TEMP: Disable audio to bypass the ffmpeg crash
    outputLocation,
    inputProps,
    timeoutInMilliseconds: 300000, // 5 minutes for render
  });

  console.log(`[Renderer] Success! Video saved to: ${outputLocation}`);

  // 4. Upload to Supabase Storage
  // TO BE IMPLEMENTED: Upload to 'motion_assets' bucket and update beats table
}

// Example usage
const beatId = process.argv[2];
if (beatId) {
  renderMotion(beatId);
} else {
  console.log('Please provide a beatId');
}
