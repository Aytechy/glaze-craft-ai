// /api/chat.ts  (Vercel Serverless Function – TypeScript)
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Minimal proxy from your frontend to your pottery search API.
 * - Calls GET http://glazeon.somee.com/api/Pottery/query?question=...&topK=...
 * - Returns { content, raw } so your UI can stay the same.
 * - No API keys. No CORS issues (server-to-server).
 */

const BASE_URL = process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, topK } = (req.body || {}) as {
      message?: string;
      topK?: number | string;
    };

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Build GET URL with query params
    const qs = new URLSearchParams({
      question: String(message),
      ...(topK ? { topK: String(topK) } : {}),
    }).toString();

    const url = `${BASE_URL}/api/Pottery/query?${qs}`;

    const upstream = await fetch(url, { method: 'GET' });

    const text = await upstream.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: (json && json.error) || text || 'Upstream error', raw: json });
    }

    // Your API returns { answer, question, success, matches, ... }
    const content = typeof json === 'object' && json?.answer
      ? json.answer
      : (typeof json === 'string' ? json : '');

    return res.status(200).json({ content, raw: json });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
