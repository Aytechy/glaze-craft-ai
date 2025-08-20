import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, imageBase64, model } = (req.body || {}) as {
      message?: string; imageBase64?: string; model?: string;
    };

    if (!message && !imageBase64) {
      return res.status(400).json({ error: 'message or imageBase64 is required' });
    }

    // Handle image uploads (your API doesn't seem to support images yet)
    if (imageBase64) {
      return res.status(400).json({ 
        error: 'Image uploads are not supported by the pottery API yet' 
      });
    }

    // Your API endpoint
    const apiUrl = 'http://glazeon.somee.com/api/Pottery/query';
    
    // Build query parameters for GET request
    const queryParams = new URLSearchParams({
      question: message || '',
      topK: '5' // Default to 5, you can make this configurable
    });

    const fullUrl = `${apiUrl}?${queryParams}`;

    // Make GET request to your API (not POST like OpenRouter)
    const r = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: text || 'Pottery API error' });
    }

    const json = await r.json();
    
    // Check if your API returned success
    if (!json.success) {
      return res.status(400).json({ error: 'Pottery API returned error' });
    }

    // Extract the answer from your API response
    const content = json.answer || 'No answer received';

    // Return in the format your frontend expects
    return res.status(200).json({ 
      content, 
      raw: json 
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}