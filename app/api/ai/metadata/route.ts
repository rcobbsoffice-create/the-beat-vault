import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { title, producer } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
      Analyze the music track title "${title}" by producer "${producer || 'Unknown'}".
      Suggest suitable metadata for a music library.
      Return ONLY a JSON object with this structure:
      {
        "genre": "string (e.g. Hip Hop, Trap, R&B)",
        "moods": ["string", "string"] (max 5 output moods),
        "description": "string (short marketing description, max 2 sentences)",
        "bpm_estimate": number (estimated integer BPM, e.g. 140)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean markdown code blocks if present
    const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const data = JSON.parse(jsonStr);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('AI Metadata Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate metadata' }, 
      { status: 500 }
    );
  }
}
