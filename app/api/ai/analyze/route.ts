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
      // Robustly remove data URL prefix if present
      const base64Data = fileBase64.includes(',') 
        ? fileBase64.split(',')[1] 
        : fileBase64.replace(/^data:.*?;base64,/, '');
      
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
      Identify metadata for this audio file: "${filename}".
      
      Return ONLY valid JSON:
      {
        "title": "Song Title",
        "bpm": number,
        "key": "Note + Scale",
        "genre": "Genre",
        "moods": ["Mood1", "Mood2"],
        "description": "1 sentence description",
        "artwork_prompt": "1 sentence visual prompt"
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
