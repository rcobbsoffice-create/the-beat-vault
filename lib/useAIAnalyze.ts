import { useState } from 'react';
import { Alert } from 'react-native';
import { supabase } from '@/lib/supabase';

const MUSICAL_KEYS = [
  'C Major', 'C Minor', 'C# Major', 'C# Minor',
  'D Major', 'D Minor', 'D# Major', 'D# Minor',
  'E Major', 'E Minor',
  'F Major', 'F Minor', 'F# Major', 'F# Minor',
  'G Major', 'G Minor', 'G# Major', 'G# Minor',
  'A Major', 'A Minor', 'A# Major', 'A# Minor',
  'B Major', 'B Minor'
];

const DARK_PHOTOS = [
  'photo-1534796636912-3b95b3ab5986', // Galaxy/Stars
  'photo-1557682250-33bd709cbe85', // Abstract Gradient
  'photo-1618005182384-a83a8bd57fbe', // Purple Waves
  'photo-1550684376-efcbd6e3f031', // Neon Lines
  'photo-1635776062127-d379bfcba9f8', // Glitch Art
  'photo-1511671782779-c97d3d27a1d4', // Studio Mic
  'photo-1470225620780-dba8ba36b745', // DJ Deck Dark
  'photo-1514525253361-b83a8ee3005a', // Concert Lights
  'photo-1493225255756-d9584f8606e9', // Smoke/Abstract
  'photo-1614613535308-eb5fbd3d2c17', // Synth Art
  'photo-1581337227003-9bb6da074094', // Cyberpunk Street
  'photo-1453090927415-5f45085b65eb', // Concrete Texture
];

const GEMINI_MODELS = ['gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.0-flash'];

const ANALYSIS_PROMPT = `You are a World-Class Audio Forensic Analyst, Hit-Making A&R, and Professional Audio Engineer. 
Analyze the provided instrumental audio and extract technical and creative metadata with absolute precision.

TECHNICAL ACCURACY:
- BPM: Detect the exact beats per minute. Be accurate to the single digit (e.g., 141, 98, 128). Analyze transients deeply.
- KEY: Identify the exact musical key (e.g., "F# Minor", "C Major").
- GENRE: Be specific (e.g., "Melodic Trap", "R&B Soul", "Modern Drill").

CREATIVE QUALITY:
- TITLE: Suggest a "cool", evocative, 1-3 word title that captures the unique soul of the music. Think cinematic, poetic, or futuristic. ABSOLUTELY AVOID generic names like "Beat", "Track", "Instrumental", "Untitled", or anything purely functional.
- DESCRIPTION: A vibrant, rhythmic 2nd-person marketing pitch (e.g., "Slide into a world of..."). Don't just list what it is; describe how it FEELS. Use punchy, high-energy language that an A&R would use to sell a multi-platinum hit. Use sensory words (e.g., "shimmering", "gritty", "haunting", "explosive").
- ARTWORK_DESCRIPTION: A vivid 5-word cinematic prompt for an album cover. IT MUST incorporate the "soul" of the track title and be unique to this specific song's vibe.

Return ONLY a raw JSON object with these exact keys:
{
  "title": "Evocative Unique Title",
  "primary_genre": "Specific Genre",
  "secondary_genre": "Style Influence",
  "bpm": integer,
  "key": "Musical Key",
  "mood_tags": ["tag1", "tag2", "tag3", "tag4"],
  "description": "Vibrant and rhythmic marketing pitch",
  "artwork_description": "Vivid unique 5-word cinematic prompt"
}`;

export interface AIAnalysisResult {
  title?: string;
  primary_genre?: string;
  secondary_genre?: string;
  bpm?: number;
  key?: string;
  mood_tags?: string[];
  description?: string;
  artwork_description?: string;
}

interface AnalyzeOptions {
  /** URI of the audio file (local file or remote URL) */
  audioUri: string;
  /** MIME type of the audio */
  mimeType?: string;
  /** If true, also generate artwork via Edge Function */
  generateArtwork?: boolean;
  /** If true, generates new artwork even if currentArtworkPreview exists */
  forceNewArtwork?: boolean;
  /** Current artwork preview — if set, artwork generation is skipped unless forceNewArtwork is true */
  currentArtworkPreview?: string | null;
}

/**
 * Shared hook for AI-powered audio analysis via Gemini.
 * Handles model fallback, JSON parsing, and artwork generation.
 */
export function useAIAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function analyze(options: AnalyzeOptions): Promise<AIAnalysisResult & { artworkUrl?: string }> {
    const { audioUri, mimeType = 'audio/wav', generateArtwork = true, currentArtworkPreview } = options;

    // 1. Convert audio to Base64
    const response = await fetch(audioUri);
    const blob = await response.blob();
    const base64Audio = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

    // 2. Get API key
    const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('Missing Gemini API Key. Please restart your dev server.');
    }

    // 3. Build payload
    const payload = {
      contents: [{
        parts: [
          { text: ANALYSIS_PROMPT },
          { inlineData: { mimeType, data: base64Audio } }
        ]
      }],
      generationConfig: { temperature: 0.7 }
    };

    // 4. Model fallback chain
    let geminiRes: Response | null = null;
    let lastError = '';

    for (const model of GEMINI_MODELS) {
      console.log(`[AI] Trying model: ${model}...`);
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (geminiRes.ok) {
        console.log(`[AI] Success with model: ${model}`);
        break;
      }

      if (geminiRes.status === 429) {
        const errBody = await geminiRes.json().catch(() => ({}));
        lastError = (errBody as any)?.error?.message || 'HTTP 429';
        console.log(`[AI] ${model} quota exhausted, trying next...`);
        continue;
      }

      const errBody = await geminiRes.json().catch(() => ({}));
      lastError = (errBody as any)?.error?.message || `HTTP ${geminiRes.status}`;
      break;
    }

    if (!geminiRes || !geminiRes.ok) {
      throw new Error(`All Gemini models exhausted. Last error: ${lastError}`);
    }

    // 5. Parse response
    const geminiData = await geminiRes.json();
    console.log('[AI] Gemini raw response:', JSON.stringify(geminiData).slice(0, 500));
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!responseText) throw new Error('Gemini returned an empty response.');

    // Strip markdown code fences
    let jsonStr = responseText.replace(/```json\n?/gi, '').replace(/```\n?/gi, '').trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) jsonStr = jsonMatch[0];

    console.log('[AI] Parsed JSON:', jsonStr);
    let aiData: AIAnalysisResult;
    try {
      aiData = JSON.parse(jsonStr);
    } catch {
      throw new Error(`Failed to parse AI response: ${jsonStr.slice(0, 200)}`);
    }

    // 6. Map musical key
    if (aiData.key) {
      const keyMatch = MUSICAL_KEYS.find(k =>
        k.toLowerCase().includes(aiData.key!.toLowerCase()) ||
        aiData.key!.toLowerCase().includes(k.toLowerCase())
      );
      if (keyMatch) aiData.key = keyMatch;
    }

    // 7. Generate artwork if requested
    let artworkUrl: string | undefined;
    const shouldGenerateArtwork = generateArtwork && aiData.artwork_description && (!currentArtworkPreview || forceNewArtwork);
    
    if (shouldGenerateArtwork) {
      try {
        const moodStr = (aiData.mood_tags || []).slice(0, 3).join(', ');
        const artPrompt = `${aiData.artwork_description}, ${moodStr}`;
        console.log('[AI] Requesting artwork:', artPrompt);

        const { data: artData, error: artError } = await supabase.functions.invoke('generate-artwork', {
          body: { prompt: artPrompt }
        });

        if (artError) throw artError;
        if (artData?.image) {
          console.log(`[AI] Artwork received (source: ${artData.source})`);
          // Add random signature to bypass potential caching
          const sig = Math.floor(Math.random() * 10000);
          artworkUrl = artData.image.includes('?') ? `${artData.image}&sig=${sig}` : `${artData.image}?sig=${sig}`;
        } else {
          throw new Error('No image in response');
        }
      } catch (imgErr: any) {
        console.log('[AI] Artwork failed, using Unsplash fallback:', imgErr.message);
        // Combine title + genre + random number to ensure unique seed
        const combinedSeed = `${aiData.title || ''}${aiData.primary_genre || ''}${Math.random()}`;
        const seedValue = combinedSeed.split('').reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
        const sig = Math.floor(Math.random() * 10000);
        artworkUrl = `https://images.unsplash.com/${DARK_PHOTOS[seedValue % DARK_PHOTOS.length]}?w=1024&h=1024&fit=crop&auto=format&sig=${sig}`;
      }
    }

    return { ...aiData, artworkUrl };
  }

  async function analyzeWithUI(options: AnalyzeOptions): Promise<(AIAnalysisResult & { artworkUrl?: string }) | null> {
    setIsAnalyzing(true);
    try {
      Alert.alert('AI Analysis Started', 'Listening to audio for analysis. This may take a few seconds...', [], { cancelable: true });
      const result = await analyze(options);
      Alert.alert('Success', 'AI Auto-Fill complete! Review the generated metadata below.');
      return result;
    } catch (err: any) {
      console.error('AI Analysis Error:', err);
      Alert.alert('AI Error', `Failed to analyze audio: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }

  return { analyze, analyzeWithUI, isAnalyzing };
}
