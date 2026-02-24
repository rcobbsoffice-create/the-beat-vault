import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''

interface QuestionnaireResponses {
  artist_name?: string
  genres?: string[]
  influences?: string
  story?: string
  achievements?: string
  goals?: string
  unique_sound?: string
  target_audience?: string
  social_media?: Record<string, string>
  upcoming_releases?: string
  collaborations?: string
  message_to_fans?: string
}

interface GeneratedContent {
  bio_short: string       // 1-2 sentences
  bio_medium: string      // Paragraph
  bio_long: string        // Full bio
  press_release: string   // For media
  social_posts: {
    twitter: string
    instagram: string
    tiktok: string
  }
  interview_answers: Record<string, string>
  marketing_hooks: string[]
  seo_keywords: string[]
}

async function generateWithOpenAI(prompt: string, maxTokens = 1500): Promise<string> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a professional music publicist and content writer specializing in artist branding. 
          Create engaging, authentic content that captures the artist's unique voice and story.
          Write in a way that appeals to music fans and industry professionals.
          Be creative but stay true to the artist's actual background and style.`
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: maxTokens,
      temperature: 0.8,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

async function generateWithAnthropic(prompt: string, maxTokens = 1500): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: maxTokens,
      system: `You are a professional music publicist and content writer specializing in artist branding. 
        Create engaging, authentic content that captures the artist's unique voice and story.`,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Anthropic error: ${error}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

async function generateAI(prompt: string, maxTokens = 1500): Promise<string> {
  // Try OpenAI first, fall back to Anthropic
  if (OPENAI_API_KEY) {
    return await generateWithOpenAI(prompt, maxTokens)
  } else if (ANTHROPIC_API_KEY) {
    return await generateWithAnthropic(prompt, maxTokens)
  }
  throw new Error('No AI API key configured')
}

async function generateArtistContent(responses: QuestionnaireResponses): Promise<GeneratedContent> {
  const artistName = responses.artist_name || 'Unknown Artist'
  const genres = responses.genres?.join(', ') || 'various genres'
  
  const context = `
Artist Name: ${artistName}
Genres: ${genres}
Musical Influences: ${responses.influences || 'Not specified'}
Artist Story: ${responses.story || 'Not provided'}
Achievements: ${responses.achievements || 'Emerging artist'}
Goals: ${responses.goals || 'Growing their audience'}
Unique Sound: ${responses.unique_sound || 'Distinctive style'}
Target Audience: ${responses.target_audience || 'Music lovers'}
Upcoming Releases: ${responses.upcoming_releases || 'New music coming soon'}
Collaborations: ${responses.collaborations || 'Open to collaborations'}
Message to Fans: ${responses.message_to_fans || 'Thank you for listening'}
  `

  // Generate short bio
  const bioShort = await generateAI(`
${context}

Write a 1-2 sentence bio for ${artistName}. Make it punchy and memorable.
Just return the bio text, no labels or explanations.
  `, 100)

  // Generate medium bio
  const bioMedium = await generateAI(`
${context}

Write a compelling one-paragraph bio (3-4 sentences) for ${artistName} that could be used on streaming platforms.
Include their sound, background, and what makes them unique.
Just return the bio text, no labels or explanations.
  `, 300)

  // Generate long bio
  const bioLong = await generateAI(`
${context}

Write a full artist bio (3-4 paragraphs) for ${artistName}. Include:
- Their origin story and musical journey
- Their unique sound and influences
- Notable achievements and releases
- Their vision and what's next
Write in third person, professionally but engagingly.
Just return the bio text, no labels or explanations.
  `, 800)

  // Generate press release
  const pressRelease = await generateAI(`
${context}

Write a professional press release for ${artistName}. Format it with:
- Attention-grabbing headline
- Opening paragraph with who/what/when/where
- Quote from the artist (use first person)
- Background information
- Closing with call to action

Make it suitable for music blogs and media outlets.
  `, 1000)

  // Generate social media posts
  const socialContent = await generateAI(`
${context}

Create social media posts for ${artistName}:

1. Twitter post (280 chars max): Announcement-style, engaging
2. Instagram caption: Story-telling, emotional, with relevant emojis and hashtag suggestions
3. TikTok caption: Trendy, Gen-Z friendly, with hook

Format as JSON:
{"twitter": "...", "instagram": "...", "tiktok": "..."}
  `, 500)

  let socialPosts = { twitter: '', instagram: '', tiktok: '' }
  try {
    const jsonMatch = socialContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      socialPosts = JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse social posts:', e)
  }

  // Generate interview answers
  const interviewContent = await generateAI(`
${context}

Generate 5 interview Q&A pairs for ${artistName}. Common music interview questions.
Format as JSON object with questions as keys and answers as values.
Example: {"What inspired your latest work?": "Answer here..."}
  `, 800)

  let interviewAnswers: Record<string, string> = {}
  try {
    const jsonMatch = interviewContent.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      interviewAnswers = JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse interview answers:', e)
  }

  // Generate marketing hooks
  const hooksContent = await generateAI(`
${context}

Generate 5 catchy marketing hooks/taglines for ${artistName} that could be used in:
- Ad campaigns
- Playlist pitches
- Press outreach
- Social media ads

Return as JSON array of strings: ["hook1", "hook2", ...]
  `, 300)

  let marketingHooks: string[] = []
  try {
    const jsonMatch = hooksContent.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      marketingHooks = JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse marketing hooks:', e)
  }

  // Generate SEO keywords
  const seoContent = await generateAI(`
Based on this artist profile:
${context}

Generate 15 SEO keywords/phrases that would help ${artistName} get discovered online.
Include genre-specific terms, descriptive words, and searchable phrases.
Return as JSON array: ["keyword1", "keyword2", ...]
  `, 200)

  let seoKeywords: string[] = []
  try {
    const jsonMatch = seoContent.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      seoKeywords = JSON.parse(jsonMatch[0])
    }
  } catch (e) {
    console.error('Failed to parse SEO keywords:', e)
  }

  return {
    bio_short: bioShort.trim(),
    bio_medium: bioMedium.trim(),
    bio_long: bioLong.trim(),
    press_release: pressRelease.trim(),
    social_posts: socialPosts,
    interview_answers: interviewAnswers,
    marketing_hooks: marketingHooks,
    seo_keywords: seoKeywords,
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { questionnaire_id, regenerate_type } = await req.json()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get questionnaire
    const { data: questionnaire, error: qError } = await supabase
      .from('artist_questionnaires')
      .select('*')
      .eq('id', questionnaire_id)
      .single()

    if (qError || !questionnaire) {
      throw new Error('Questionnaire not found')
    }

    // Verify ownership
    if (questionnaire.artist_id !== user.id) {
      // Check if admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role !== 'admin' && profile?.role !== 'editor') {
        throw new Error('Unauthorized')
      }
    }

    // Update status to processing
    await supabase
      .from('artist_questionnaires')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', questionnaire_id)

    // Generate content
    const generatedContent = await generateArtistContent(questionnaire.responses)

    // Save generated content
    const { error: updateError } = await supabase
      .from('artist_questionnaires')
      .update({
        status: 'generated',
        generated_content: generatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', questionnaire_id)

    if (updateError) throw updateError

    // Also update artist_profiles_ext with the bio
    await supabase
      .from('artist_profiles_ext')
      .upsert({
        profile_id: questionnaire.artist_id,
        bio: generatedContent.bio_long,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'profile_id' })

    return new Response(
      JSON.stringify({
        success: true,
        content: generatedContent,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Content generation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
