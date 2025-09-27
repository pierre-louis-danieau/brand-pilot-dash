import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { prompt, tone, length, profileId } = await req.json();

    if (!prompt || !tone || !length) {
      throw new Error('Prompt, tone, and length are required');
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to your Supabase Edge Functions environment variables.');
    }

    // Get user profile for context
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let userContext = '';
    if (profileId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('about_context, topics_of_interest, ai_voice')
        .eq('id', profileId)
        .single();

      if (profile) {
        userContext = `
User context: ${profile.about_context || 'No specific context provided'}
Topics of interest: ${profile.topics_of_interest?.join(', ') || 'General topics'}
Preferred voice: ${profile.ai_voice || 'professional'}`;
      }
    }

    // Create system prompt based on tone and length
    const toneInstructions = {
      professional: "Write in a professional, authoritative tone suitable for business networking.",
      friendly: "Write in a warm, approachable tone that feels conversational and welcoming.",
      witty: "Write with clever humor and wit, making the content engaging and memorable.",
      inspirational: "Write in an uplifting, motivational tone that inspires and encourages action.",
      educational: "Write in an informative, teaching tone that explains concepts clearly."
    };

    const lengthInstructions = {
      short: "Keep it very concise, 1-2 sentences maximum.",
      medium: "Write 3-4 sentences with moderate detail.",
      long: "Write 5+ sentences with comprehensive detail, but stay under 280 characters."
    };

    const systemPrompt = `You are an expert social media content creator. Generate a Twitter post based on the user's input.

REQUIREMENTS:
- Maximum 280 characters (this is critical - count carefully)
- Tone: ${toneInstructions[tone as keyof typeof toneInstructions]}
- Length: ${lengthInstructions[length as keyof typeof lengthInstructions]}
- Make it engaging and suitable for Twitter
- Include relevant hashtags if appropriate (but count them in character limit)
- Do not use quotes around the post
${userContext}

Generate ONLY the post content, nothing else.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let generatedPost = data.choices[0]?.message?.content?.trim();

    if (!generatedPost) {
      throw new Error('No content generated from OpenAI');
    }

    // Ensure 280 character limit
    if (generatedPost.length > 280) {
      generatedPost = generatedPost.substring(0, 277) + '...';
    }

    return new Response(JSON.stringify({ 
      post: generatedPost,
      characterCount: generatedPost.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Generate post error:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while generating the post'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
