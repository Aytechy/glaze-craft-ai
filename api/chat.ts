// /api/chat.ts — enhanced answer composer, returns ONLY { content }
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');

// naive sentence split to avoid heavy deps
function splitSentences(t: string): string[] {
  if (!t) return [];
  return t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map(s => s.trim())
    .filter(Boolean);
}

// simple dedupe + cap length
function composeDetailed(answer: string, matches: any[], maxChars = 1200): string {
  const picked: string[] = [];
  const seen = new Set<string>();

  // seed with backend answer sentences first
  for (const s of splitSentences(answer)) {
    const k = s.toLowerCase();
    if (!seen.has(k)) { seen.add(k); picked.push(s); }
  }

  // then mine matches (title -> lede -> description)
  for (const m of matches || []) {
    const fields = [m?.title, m?.lede, m?.description];
    for (const f of fields) {
      for (const s of splitSentences(String(f || ''))) {
        const k = s.toLowerCase();
        if (k.length < 20) continue;              // skip very short
        if (seen.has(k)) continue;                // dedupe exact
        const prefix = k.slice(0, 40);            // skip near-dup by prefix
        if ([...seen].some(x => x.startsWith(prefix))) continue;

        picked.push(s);
        seen.add(k);
        if (picked.join(' ').length > maxChars) break;
      }
      if (picked.join(' ').length > maxChars) break;
    }
    if (picked.join(' ').length > maxChars) break;
  }

  const head = picked.shift() || '';
  const body = picked.join(' ');
  const out = [head, body].filter(Boolean).join(' ');

  return out.length > maxChars ? out.slice(0, maxChars).replace(/\s+\S*$/, '') : out;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, topK, maxChars = 1200 } = (req.body || {}) as {
      message?: string;
      topK?: number | string;
      maxChars?: number;
    };
    if (!message) return res.status(400).json({ error: 'message is required' });

    const qs = new URLSearchParams({
      question: String(message),
      ...(topK ? { topK: String(topK) } : {})
    }).toString();
    const url = `${BASE_URL}/api/Pottery/query?${qs}`;

    const upstream = await fetch(url, { method: 'GET' });
    const text = await upstream.text();

    let json: any; try { json = JSON.parse(text); } catch { json = text; }
    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: (json && (json.error || json.message)) || text || 'Upstream error'
      });
    }

    const baseAnswer =
      typeof json === 'object' ? (json?.answer ?? '') : (typeof json === 'string' ? json : '');
    const matches =
      (typeof json === 'object' && Array.isArray(json?.matches)) ? json.matches : [];

    const composed =
      (baseAnswer && baseAnswer.length > 60)
        ? composeDetailed(baseAnswer, matches, Number(maxChars) || 1200)
        : composeDetailed('Here’s what we can tell from our knowledge base.', matches, Number(maxChars) || 1200);

    const content =
      composed ||
      baseAnswer ||
      'We could not find enough about that topic. Try a related term like “cone 6 firing”, “oxidation vs reduction”, or “bisque firing schedule”.';

    return res.status(200).json({ content });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
