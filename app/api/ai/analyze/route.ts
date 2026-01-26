import { NextRequest, NextResponse } from 'next/server';
import { model } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    const { filename, fileBase64, contentType } = await request.json();

    console.log('--- AI Analysis Request ---');
    console.log('Filename:', filename);
    console.log('Content-Type:', contentType);
    console.log('Base64 Length:', fileBase64 ? fileBase64.length : 'MISSING');

    if (!filename) {
      return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
    }

    // Initialize prompt parts
    let promptParts: any[] = [];
    
    // If we have actual file data, include it
    if (fileBase64 && contentType) {
      // Remove data URL prefix if present
      const base64Data = fileBase64.replace(/^data:audio\/\w+;base64,/, '');
      
      promptParts.push({
        inlineData: {
          data: base64Data,
          mimeType: contentType
        }
      });
      promptParts.push("Listen to this audio track.");
    }

    promptParts.push(`
      Analyze this beat (Filename: "${filename}") and generate JSON metadata.
      STRICT JSON FORMAT ONLY. No markdown blocks.
      
      Extract/Generate:
      - title: A creative, commercial title based on the vibe (not just the filename).
      - bpm: Estimated BPM (integer).
      - key: Estimated Key (e.g. C Minor).
      - genre: Primary genre (Hip Hop, Trap, R&B, Drill, etc.).
      - moods: Array of 3-5 mood strings.
      - description: A compelling 2-sentence marketing description.
      - suggested_label: A creative imaginary label name fitting the style.
      - suggested_publisher: A creative imaginary publisher name.

      Example JSON:
      {
        "title": "Neon Nights",
        "bpm": 140,
        "key": "F# Minor",
        "genre": "Synthwave",
        "moods": ["Retro", "Driving", "Nocturnal"],
        "description": "A driving synthwave track with pulsating basslines. Perfect for night drives and retro visuals.",
        "suggested_label": "Midnight Run Records",
        "suggested_publisher": "Retro Wave Publishing"
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

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
