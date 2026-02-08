import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { filename, fileBase64, contentType, audioUrl } = await request.json();

    console.log('--- AI Analysis Request ---');
    console.log('Filename:', filename);
    console.log('Audio URL:', audioUrl ? 'PROVIDED' : 'NONE');
    
    // Initialize prompt parts
    let promptParts: any[] = [];
    
    // 1. If we have a URL, fetch it server-side to bypass CORS/Size limits in browser
    if (audioUrl) {
      console.log('Fetching audio from URL:', audioUrl);
      const audioRes = await fetch(audioUrl);
      if (!audioRes.ok) throw new Error('Failed to fetch audio from URL');
      
      const buffer = await audioRes.arrayBuffer();
      const base64Data = Buffer.from(buffer).toString('base64');
      const detectedMime = audioRes.headers.get('Content-Type') || 'audio/mpeg';

      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: detectedMime
        }
      });
    } 
    // 2. Fallback to provided base64 if no URL
    else if (fileBase64 && contentType) {
      const base64Data = fileBase64.replace(/^data:audio\/\w+;base64,/, '');
      
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: contentType
        }
      });
    }

    if (promptParts.length > 0) {
      promptParts.push("Listen to this audio track.");
    }

    promptParts.push(`
      As an expert musicologist and audio engineer, perform a technical analysis of this audio file (Filename: "${filename}"). 
      Focus on extracting highly reliable metadata for a professional music library.

      STRICT JSON FORMAT ONLY. No markdown blocks.
      
      Technical Analysis Instructions:
      1. BPM DETECTION: Identify the dominant pulse or transient pattern. Be precise. Even for complex rhythms, determine the core tempo.
      2. KEY & SCALE DETECTION: Identify the tonic center (root note) and the scale/mode (e.g., Minor, Major, Phrygian). Use standard notation (e.g., "C# Minor").
      3. MUSICAL VIBE: Identify the primary genre and specific sub-genres or styles.
      4. ARTWORK PROMPT: Create a detailed, atmospheric prompt for a high-end album cover based on the sonic textures detected.

      Return the results in this JSON structure:
      {
        "title": "Creative Title",
        "bpm": number (integer),
        "key": "Note + Scale (e.g. Eb Major)",
        "genre": "Primary Genre",
        "moods": ["Mood1", "Mood2", "Mood3"],
        "description": "Short marketing description (max 2 sentences)",
        "suggested_label": "Creative imaginary label",
        "suggested_publisher": "Creative imaginary publisher",
        "artwork_prompt": "Vivid artistic prompt for AI image generation"
      }

      Example JSON:
      {
        "title": "Neon Nights",
        "bpm": 128,
        "key": "G Minor",
        "genre": "Synthwave",
        "moods": ["Atmospheric", "Driving", "Nostalgic"],
        "description": "A driving synthwave track with pulsating basslines and lush pads. Perfect for retro-futuristic visuals.",
        "suggested_label": "Quartz Records",
        "suggested_publisher": "Midnight Music Publishing",
        "artwork_prompt": "A cinematic retro-futuristic city at night with purple neon lights and a sports car driving into the distance, highly detailed digital art."
      }
    `);

    console.log('Generating content with model...');
    const result = await model.generateContent(promptParts);
    console.log('Content generated. Getting response...');
    const response = await result.response;
    const text = response.text();
    console.log('Gemini Response Text:', text.substring(0, 100) + '...');

    // Clean up potential markdown code blocks
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Analysis Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    // Fallback if AI fails (e.g. file too large or API error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Note: In Next.js App Router, body size limit defaults to 4MB (Vercel).
// For larger uploads, consider signed URLs or client-side uploads.
