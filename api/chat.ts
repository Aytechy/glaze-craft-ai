// /api/chat.ts  — Vercel Serverless Function (TypeScript)
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Proxy -> GET {BASE_URL}/api/Pottery/query?question=...&topK=...
 * Returns: { content, success, question, sources[], raw }
 * No API keys. Host comes from env with a safe fallback.
 */

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, topK, includeMatches = true, maxSources = 5 } = (req.body || {}) as {
      message?: string;
      topK?: number | string;
      includeMatches?: boolean;
      maxSources?: number;
    };

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Build GET URL
    const qs = new URLSearchParams({
      question: String(message),
      ...(topK ? { topK: String(topK) } : {})
    }).toString();
    const url = `${BASE_URL}/api/Pottery/query?${qs}`;

    const upstream = await fetch(url, { method: 'GET' });
    const text = await upstream.text();

    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: (json && json.error) || text || 'Upstream error',
        raw: json
      });
    }

    // Normalize
    const answer = typeof json === 'object' ? (json?.answer ?? '') : (typeof json === 'string' ? json : '');
    const success = typeof json === 'object' ? !!json?.success : true;
    const question = typeof json === 'object' ? (json?.question ?? String(message)) : String(message);

    const sources =
      includeMatches && Array.isArray(json?.matches)
        ? json.matches.slice(0, Math.max(0, Number(maxSources) || 5)).map((m: any) => ({
            id: m?.id,
            title: m?.title,
            lede: m?.lede,
            description: m?.description,
            score: m?.score,
            entryType: m?.entryType,
            source: m?.source,
            tags: m?.tags,
          }))
        : [];

    return res.status(200).json({
      content: answer, // your UI already reads this
      success,
      question,
      sources,         // optional references for UI
      raw: json        // full upstream payload
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
