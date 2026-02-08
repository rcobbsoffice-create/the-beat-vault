import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, beatId } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Generate image using Pollinations.ai (Free, fast, no key required for demo)
    console.log('--- AI Artwork Generation ---');
    console.log('Prompt:', prompt.substring(0, 100) + '...');
    
    // We encode the prompt to be URL-safe
    const encodedPrompt = encodeURIComponent(prompt);
    // Add some random noise to ensure unique results
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

    console.log('Fetching from Pollinations:', imageUrl);

    // Fetch the image data
    const imageRes = await fetch(imageUrl);
    if (!imageRes.ok) {
        const errorText = await imageRes.text();
        console.error('Pollinations Error:', errorText);
        throw new Error(`Failed to generate image: ${imageRes.statusText}`);
    }
    
    const imageArrayBuffer = await imageRes.arrayBuffer();

    // Upload to Supabase Storage
    const supabase = createServiceClient();
    
    // Ensure bucket exists and is public
    const { data: bucket, error: bucketError } = await supabase.storage.getBucket('beat-covers');
    if (bucketError || !bucket) {
      console.log('Bucket "beat-covers" missing. Creating...');
      await supabase.storage.createBucket('beat-covers', {
        public: true,
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });
    }

    const fileName = `ai-${beatId || 'gen'}-${Date.now()}.png`;
    const filePath = `${fileName}`;

    console.log('Uploading to Supabase Storage:', filePath);

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('beat-covers')
      .upload(filePath, imageArrayBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (uploadError) {
        console.error('Supabase Upload Error:', uploadError);
        throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('beat-covers')
      .getPublicUrl(filePath);

    console.log('Generated Public URL:', publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error('Artwork Generation API Error:', error);
    return NextResponse.json({ 
        error: error.message, 
        details: error.statusText || error.code || 'See server logs' 
    }, { status: 500 });
  }
}
