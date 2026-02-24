import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for local/frontend access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe, native ArrayBuffer to Base64 in JS
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { audioUrl } = await req.json();
    if (!audioUrl) throw new Error('Missing audioUrl');

    console.log(`[Edge Function] Analyzing audio from URL: ${audioUrl}`);

    // 1. Fetch the remote audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio from URL: ${audioResponse.statusText}`);
    }
    
    // Convert audio to base64 for Gemini securely
    const arrayBuffer = await audioResponse.arrayBuffer();
    const base64Audio = arrayBufferToBase64(arrayBuffer);
    const mimeType = audioResponse.headers.get('content-type') || 'audio/wav';

    // 2. Prepare Gemini REST request
    const apiKey = Deno.env.get('GOOGLE_GENERATIVE_AI_API_KEY');
    if (!apiKey) throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
    
    const prompt = `You are an expert music producer and A&R. I am providing you with an instrumental beat.
Analyze the audio and generate metadata for it. 

Return ONLY a raw JSON object with the following exact keys (no markdown, no backticks, just the JSON):
{
  "title": "A catchy, relevant 1-3 word title for this beat",
  "primary_genre": "The main genre (e.g., Trap, R&B, Boom Bap, Drill, Lo-fi)",
  "secondary_genre": "A distinct sub-genre or secondary influence",
  "bpm": "The estimated BPM as an integer",
  "key": "The musical key (e.g., C Minor, C# Major)",
  "mood_tags": ["tag1", "tag2", "tag3", "tag4"],
  "description": "A punchy 1-2 sentence description for a beat store"
}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Audio
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
      }
    };

    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        console.error(`Gemini API Error (${geminiRes.status}):`, errorText);
        throw new Error(`Gemini API returned ${geminiRes.status}`);
    }

    const result = await geminiRes.json();
    
    let responseText = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (!responseText) {
        throw new Error('No text returned from Gemini');
    }

    // 3. Parse JSON
    let jsonStr = responseText;
    if (jsonStr.startsWith('```json')) jsonStr = jsonStr.replace(/```json\n/g, '').replace(/```\n?/g, '');
    else if (jsonStr.startsWith('```')) jsonStr = jsonStr.replace(/```\n/g, '').replace(/```\n?/g, '');

    const metadata = JSON.parse(jsonStr.trim());

    return new Response(JSON.stringify({ 
      success: true, 
      metadata
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error(`[Edge Function Error]: ${error?.message || 'Unknown error'}`);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
