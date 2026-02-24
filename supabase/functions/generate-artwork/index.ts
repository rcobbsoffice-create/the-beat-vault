import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: "Missing prompt" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const apiKey = Deno.env.get("GOOGLE_GENERATIVE_AI_API_KEY") || Deno.env.get("EXPO_PUBLIC_GOOGLE_GENERATIVE_AI_API_KEY");
    if (!apiKey) {
      throw new Error("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    // Enhanced prompt for album cover art
    const artPrompt = `Create a stunning album cover artwork: ${prompt}. Style: cinematic, high contrast, dramatic lighting, dark aesthetic, 4K quality, professional music album cover. No text or words in the image.`;

    // Try Gemini image generation models in order
    const models = [
      "gemini-2.0-flash-exp-image-generation",
      "gemini-2.5-flash-image",
    ];

    let imageBase64 = null;

    for (const model of models) {
      console.log(`[generate-artwork] Trying model: ${model}`);
      
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: artPrompt }] }],
            generationConfig: {
              responseModalities: ["TEXT", "IMAGE"],
            },
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.log(`[generate-artwork] ${model} failed: ${res.status} - ${(err as any)?.error?.message || 'unknown'}`);
        continue;
      }

      const data = await res.json();
      const parts = data.candidates?.[0]?.content?.parts || [];
      
      for (const part of parts) {
        if (part.inlineData?.mimeType?.startsWith("image/")) {
          imageBase64 = part.inlineData.data;
          console.log(`[generate-artwork] Got image from ${model} (${imageBase64.length} chars base64)`);
          break;
        }
      }

      if (imageBase64) break;
    }

    if (imageBase64) {
      return new Response(JSON.stringify({ 
        image: `data:image/png;base64,${imageBase64}`,
        source: "gemini-ai"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback: Dynamic Unsplash search for relevant high-quality photo
    console.log("[generate-artwork] Gemini image gen failed, falling back to dynamic Unsplash");
    const keywords = prompt.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ').filter((w: string) => w.length > 3).slice(0, 4);
    keywords.push('dark', 'music', 'cinematic');
    const query = keywords.join(',');
    const sig = Math.floor(Math.random() * 1000000);
    const fallbackUrl = `https://images.unsplash.com/featured/1024x1024/?${encodeURIComponent(query)}&sig=${sig}`;

    return new Response(JSON.stringify({
      image: fallbackUrl,
      source: "unsplash-dynamic"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[generate-artwork] Error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
