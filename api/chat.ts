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

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OPENROUTER_API_KEY is missing' });
    }

    const referer =
      (req.headers.origin as string) ||
      process.env.PUBLIC_URL ||
      'https://your-app.vercel.app';

    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': referer,
        'X-Title': 'Glaze Craft AI',
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are Glaze Craft AI.' },
          { role: 'user', content: message || '' },
          ...(imageBase64 ? [{ role: 'user', content: `Image:\n${imageBase64}` }] : []),
        ],
      }),
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      return res.status(r.status).json({ error: text || 'Upstream error' });
    }

    const json = await r.json();
    const content =
      json?.choices?.[0]?.message?.content ??
      json?.choices?.[0]?.delta?.content ??
      '';

    return res.status(200).json({ content, raw: json });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
