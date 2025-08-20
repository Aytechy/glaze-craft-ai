// /api/chat.ts — adaptive, formatted, cleaned. Returns ONLY { content }.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');

/** ---------------- Length inference ---------------- */
type LengthMode = 'short' | 'medium' | 'long';

function inferLengthFromQuery(q: string): LengthMode {
  const s = q.toLowerCase().trim();

  // Hard short signals
  if (/\b(short|brief|tl;dr|summary|summarize|in a sentence|one line|quick)\b/.test(s)) return 'short';

  // Long, procedural or guide-like
  if (/\b(how|guide|tutorial|technique|techniques|steps|process|build|make|recipe|schedule|troubleshoot|fix|prevent|best practices|step-by-step)\b/.test(s)) {
    return 'long';
  }

  // Very short topic queries → medium
  if (s.split(/\s+/).length <= 3) return 'medium';

  return 'medium';
}
function targetChars(mode: LengthMode): number {
  switch (mode) {
    case 'short': return 420;      // ~70–90 words
    case 'long':  return 1600;     // ~250–350 words
    default:      return 900;      // ~140–200 words
  }
}

/** ---------------- Text utils ---------------- */
function normalizeWhitespace(t: string): string {
  return (t || '').replace(/\s+/g, ' ').trim();
}

// remove leading/trailing **…** or stray asterisks/quotes from copy-paste
function stripCopyArtifacts(t: string): string {
  if (!t) return '';
  let s = t
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/\*{3,}/g, '**')         // collapse *** → **
    .trim();

  // remove global wrapping quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // remove global wrapping **…**
  if (s.startsWith('**') && s.endsWith('**')) {
    s = s.slice(2, -2).trim();
  }
  // remove stray leading/trailing asterisks
  s = s.replace(/^\*+/, '').replace(/\*+$/, '').trim();

  // collapse duplicate “No relevant … found” lines
  s = s.replace(/(No relevant [^.]*? found\. Please try rephrasing your question\.)\s*\1+/gi, '$1');

  return s;
}

function splitSentences(t: string): string[] {
  if (!t) return [];
  return t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map(s => s.trim())
    .filter(Boolean);
}
function dedupeSentences(sentences: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of sentences) {
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    if (/^no relevant .* found/i.test(s) && out.some(x => /^no relevant .* found/i.test(x))) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

/** ---------------- Composition + formatting ---------------- */
// Build a richer text from base answer + matches
function composeDetailed(answer: string, matches: any[], maxChars: number): string {
  const picked: string[] = [];
  const base = dedupeSentences(splitSentences(answer));
  picked.push(...base);

  for (const m of matches || []) {
    for (const field of [m?.title, m?.lede, m?.description]) {
      const ss = dedupeSentences(splitSentences(String(field || '')));
      for (const s of ss) {
        if (s.length < 20) continue; // ignore very short fragments
        picked.push(s);
        if (picked.join(' ').length > maxChars) break;
      }
      if (picked.join(' ').length > maxChars) break;
    }
    if (picked.join(' ').length > maxChars) break;
  }

  let out = picked.join(' ');
  if (out.length > maxChars) out = out.slice(0, maxChars).replace(/\s+\S*$/, '');
  return stripCopyArtifacts(out);
}

// Convert into tidy markdown (headings/bullets if procedural)
function formatMarkdown(content: string, isProcedural: boolean): string {
  if (!content) return '';

  // Treat "Thh <text>" as a heading signal
  let text = content.replace(/\bThh\b\s*([^\n.]+)\.?/g, (_, h) => `\n\n### **${String(h).trim()}**\n\n`);

  if (isProcedural) {
    const sentences = splitSentences(text);
    // pick step-like lines
    const steps = sentences.filter(s =>
      /\b(step|then|next|finally|ensure|avoid|use|mix|wedge|center|pull|trim|dry|bisque|glaze|fire|cool|inspect|measure|program|hold|soak|load)\b/i.test(s)
      || /^(\s*(do|don’t|use|avoid|keep|reduce|increase)\b)/i.test(s)
    );

    const paras = text.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
    const parts: string[] = [];

    if (paras.length) parts.push(`### **Overview**\n\n${paras[0]}`);

    if (steps.length) {
      parts.push(
        `### **Key Steps**\n\n` +
        steps.map(s => `- ${s}`).join('\n')
      );
    }

    // tips / issues
    const tips = sentences.filter(s =>
      /\b(tip|avoid|common|issue|defect|problem|crazing|pinholes|blister|dunting|warping|crack|bloating|shivering|crawling|safety)\b/i.test(s)
    );
    if (tips.length) {
      parts.push(
        `### **Tips & Issues**\n\n` +
        tips.slice(0, 8).map(s => `- ${s}`).join('\n')
      );
    }

    if (parts.length) return parts.join('\n\n') + '\n';
  }

  // non-procedural: keep paragraphs readable
  return text.replace(/([.!?])\s+(?=[A-Z(])/g, '$1  ');
}

/** ---------------- Handler ---------------- */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, topK, maxChars, length }: {
      message?: string;
      topK?: number | string;
      maxChars?: number;                  // optional hard cap
      length?: LengthMode;                // optional override
    } = (req.body || {}) as any;

    if (!message) return res.status(400).json({ error: 'message is required' });

    const inferred: LengthMode = (length && ['short','medium','long'].includes(length))
      ? (length as LengthMode)
      : inferLengthFromQuery(message);

    const budget = Math.min(Math.max(220, maxChars || targetChars(inferred)), 3200);
    const isProcedural = /\b(how|guide|tutorial|technique|techniques|steps|process|build|make|recipe|schedule|troubleshoot|fix|prevent|best practices|step-by-step)\b/i.test(message);

    // Call your API
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

    const baseAnswerRaw = typeof json === 'object' ? (json?.answer ?? '') : (typeof json === 'string' ? json : '');
    const baseAnswer = stripCopyArtifacts(baseAnswerRaw);
    const matches = (typeof json === 'object' && Array.isArray(json?.matches)) ? json.matches : [];

    const looksLikeNoInfo = /^no relevant .* found/i.test(baseAnswer || '');
    const composed = composeDetailed(looksLikeNoInfo ? '' : baseAnswer, matches, budget);

    const rawContent = (composed && composed.length > Math.min(160, budget * 0.25))
      ? composed
      : (baseAnswer || '');

    const safeContent = normalizeWhitespace(
      rawContent ||
      'We couldn’t find enough on that. Try a related term like “cone 6 firing schedule”, “oxidation vs reduction”, or “bisque firing steps”.'
    );

    const formatted = formatMarkdown(safeContent, isProcedural);

    return res.status(200).json({ content: formatted });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
