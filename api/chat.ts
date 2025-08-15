import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log('=== API Route Debug Info ===');
    console.log('Method:', req.method);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body:', JSON.stringify(req.body, null, 2));

    if (req.method !== 'POST') {
      console.log('❌ Method not allowed:', req.method);
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, imageBase64, model } = (req.body || {}) as {
      message?: string; imageBase64?: string; model?: string;
    };

    console.log('Parsed request data:', { 
      hasMessage: !!message, 
      hasImage: !!imageBase64, 
      model: model || 'default' 
    });

    if (!message && !imageBase64) {
      console.log('❌ No message or image provided');
      return res.status(400).json({ error: 'message or imageBase64 is required' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    console.log('API Key status:', apiKey ? `Present (${apiKey.substring(0, 8)}...)` : 'MISSING');
    
    if (!apiKey) {
      console.log('❌ OPENROUTER_API_KEY is missing from environment variables');
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is missing' });
    }

    const referer =
      (req.headers.origin as string) ||
      process.env.PUBLIC_URL ||
      'https://glazeon-craft-ai.vercel.app/'; 

    console.log('Using referer:', referer);

    const requestBody = {
      model: model || 'openai/gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are Master Ceramics, the AI assistant for GlazionStudio. You help with ceramics, glaze recipes, and pottery techniques.' }, 
        { role: 'user', content: message || '' },
        ...(imageBase64 ? [{ role: 'user', content: `Image:\n${imageBase64}` }] : []),
      ],
    };

    console.log('Sending request to OpenRouter with:', {
      model: requestBody.model,
      messageCount: requestBody.messages.length,
      hasImageData: !!imageBase64
    });

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'Master Ceramics', 
      },
      body: JSON.stringify(requestBody),
    });

    console.log('OpenRouter response status:', r.status);
    console.log('OpenRouter response headers:', Object.fromEntries(r.headers.entries()));

    if (!r.ok) {
      let errorText = '';
      try {
        errorText = await r.text();
        console.log('❌ OpenRouter error response:', errorText);
      } catch (textError) {
        console.log('❌ Failed to read OpenRouter error response:', textError);
        errorText = `HTTP ${r.status} - Unable to read error response`;
      }
      
      return res.status(r.status).json({ 
        error: errorText || 'Upstream error',
        details: {
          status: r.status,
          statusText: r.statusText,
          url: 'https://openrouter.ai/api/v1/chat/completions'
        }
      });
    }

    let json;
    try {
      json = await r.json();
      console.log('OpenRouter success response structure:', {
        hasChoices: !!json?.choices,
        choicesLength: json?.choices?.length || 0,
        firstChoiceHasMessage: !!json?.choices?.[0]?.message,
        firstChoiceHasContent: !!json?.choices?.[0]?.message?.content
      });
    } catch (jsonError) {
      console.log('❌ Failed to parse OpenRouter JSON response:', jsonError);
      return res.status(500).json({ 
        error: 'Failed to parse response from OpenRouter',
        details: jsonError.message 
      });
    }

    const content =
      json?.choices?.[0]?.message?.content ??
      json?.choices?.[0]?.delta?.content ??
      '';

    console.log('Extracted content length:', content.length);
    console.log('✅ Request completed successfully');

    return res.status(200).json({ content, raw: json });

  } catch (err) {
    console.error('❌ Unhandled error in API route:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // More detailed error info
    if (err instanceof TypeError && err.message.includes('fetch')) {
      console.error('🔍 This appears to be a fetch/network error');
      return res.status(500).json({ 
        error: 'Network error when contacting OpenRouter',
        details: err.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Server error',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
  }
}