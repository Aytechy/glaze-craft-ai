// /api/chat.ts — KB-first with Conversation fallback. Returns ONLY { content }.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');
const KB_TIMEOUT_MS = 10_000;
const CONV_TIMEOUT_MS = 10_000;

/* -------------------- Intent: short / medium / long -------------------- */
type Mode = 'short' | 'medium' | 'long';

function inferMode(q: string): Mode {
  const s = (q || '').toLowerCase();

  // Strong signals for LONG (procedural / tutorial / brainstorming)
  if (/\b(how|how to|guide|tutorial|technique|techniques|steps|process|build|make|recipe|schedule|troubleshoot|fix|prevent|best practices|ideas|examples|compare|vs|advantages|disadvantages|pros|cons|materials|tools)\b/.test(s)) {
    return 'long';
  }

  // Strong signals for SHORT
  if (/\b(short|brief|tl;dr|summary|one line|in a sentence|quick)\b/.test(s)) {
    return 'short';
  }

  // Simple definition / head term → MEDIUM
  if (s.split(/\s+/).length <= 3) return 'medium';

  // Default
  return 'medium';
}

/* --------------------------- Text utilities --------------------------- */
function normalizeWhitespace(t: string): string {
  return (t || '').replace(/\s+/g, ' ').trim();
}

// Clean copy/paste artifacts (quotes, extra asterisks, wrapping **…**)
function stripArtifacts(t: string): string {
  if (!t) return '';
  let s = t
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/\*{3,}/g, '**')
    .trim();

  // remove full-string wrapping quotes
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  // remove full-string wrapping **…**
  if (s.startsWith('**') && s.endsWith('**')) {
    s = s.slice(2, -2).trim();
  }
  // remove stray leading/trailing asterisks
  s = s.replace(/^\*+/, '').replace(/\*+$/, '').trim();

  // collapse duplicated "No relevant … found" lines
  s = s.replace(
    /(No relevant [^.]*? found\. Please try rephrasing your question\.)\s*\1+/gi,
    '$1'
  );

  return s;
}

// Sentence splitter (keeps sentences whole; avoids mid-cut)
function splitSentences(t: string): string[] {
  if (!t) return [];
  return t
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=[A-Z0-9(])/)
    .map(s => s.trim())
    .filter(Boolean);
}

function dedupeSentences(lines: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of lines) {
    const k = s.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
  }
  return out;
}

function looksLikeNoInfo(s: string): boolean {
  return /^no relevant .* found/i.test(s || '');
}

/* ------------------------ Markdown-aware helpers ---------------------- */
// Respect backend "Thh Title" as a heading marker
function applyThhHeadings(text: string): string {
  return (text || '').replace(/\bThh\b\s*([^\n.]+)\.?/g, (_, h) => `\n\n### **${String(h).trim()}**\n\n`);
}

// If answer already contains ordered items "1. **Title**: …", keep them.
// Otherwise, we can create neat bullets from matches when needed.
function bulletify(list: string[]): string {
  return list.map(s => `- ${s}`).join('\n');
}

/* ----------------------- Composition (by mode) ------------------------ */
// SHORT → answer only (cleaned), nothing else.
function composeShort(answer: string): string {
  return stripArtifacts(answer);
}

// MEDIUM → answer + a few relevant, non-duplicate bits from matches.
function composeMedium(answer: string, matches: any[]): string {
  const base = stripArtifacts(answer);
  const picked: string[] = [];

  // Take 3–6 supporting sentences from matches (lede/description), no duplicates
  for (const m of matches || []) {
    for (const field of [m?.lede, m?.description]) {
      const ss = dedupeSentences(splitSentences(stripArtifacts(String(field || ''))));
      for (const s of ss) {
        if (s.length < 20) continue;
        picked.push(s);
        if (picked.length >= 6) break;
      }
      if (picked.length >= 6) break;
    }
    if (picked.length >= 6) break;
  }

  if (!picked.length) return base;

  // Keep paragraphs readable
  return `${base}\n\n${bulletify(picked)}`;
}

// LONG → structured markdown: Overview, Key Steps/Points, Tips & Issues, plus elaboration.
// Uses answer + ALL relevant matches (titles/lede/description), deduped, no mid-sentence cuts.
function composeLong(question: string, answer: string, matches: any[]): string {
  const procedural = /\b(how|how to|guide|tutorial|technique|techniques|steps|process|build|make|recipe|schedule|troubleshoot|fix|prevent|best practices)\b/i.test(question);
  const base = stripArtifacts(answer);

  // Start with Overview (answer or first good sentence)
  const overview = base || (splitSentences(stripArtifacts(matches?.[0]?.description || '')).shift() || '');

  // Gather step-like and key-point sentences
  const stepLike: string[] = [];
  const keyPoints: string[] = [];

  const pushSentences = (text?: string) => {
    const ss = dedupeSentences(splitSentences(stripArtifacts(String(text || ''))));
    for (const s of ss) {
      if (s.length < 20) continue;
      if (/\b(step|then|next|finally|ensure|avoid|use|mix|wedge|center|pull|trim|dry|bisque|glaze|fire|cool|inspect|measure|program|hold|soak|load)\b/i.test(s)) {
        stepLike.push(s);
      } else {
        keyPoints.push(s);
      }
    }
  };

  // Seed with answer
  pushSentences(base);

  // Add from matches: title as bold point + lede/description sentences
  const elaborations: string[] = [];
  for (const m of matches || []) {
    const title = stripArtifacts(m?.title || '');
    const lede = stripArtifacts(m?.lede || '');
    const desc = stripArtifacts(m?.description || '');

    if (title) elaborations.push(`**${title}**`);
    if (lede) pushSentences(lede);
    if (desc) pushSentences(desc);
  }

  // Dedupe lists
  const deStep = dedupeSentences(stepLike);
  const dePoints = dedupeSentences(keyPoints);
  const deElabs = dedupeSentences(elaborations);

  // Build markdown
  let out: string[] = [];

  if (overview) {
    out.push(`### **Overview**\n\n${overview}`);
  }

  if (procedural && deStep.length) {
    out.push(`### **Key Steps**\n\n${bulletify(deStep)}`);
  }

  // If not strongly procedural, show key points first
  if (!procedural && dePoints.length) {
    out.push(`### **Key Points**\n\n${bulletify(dePoints)}`);
  } else if (procedural && dePoints.length) {
    // For procedural, keep points too if present
    out.push(`### **Notes & Parameters**\n\n${bulletify(dePoints)}`);
  }

  if (deElabs.length) {
    out.push(`### **Related Topics**\n\n${bulletify(deElabs)}`);
  }

  let result = out.join('\n\n');
  result = applyThhHeadings(result);

  // Final cleanup & spacing
  result = result
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return result || stripArtifacts(answer);
}

/* ------------------------------ Fetch utils --------------------------- */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(t);
  }
}

/* ---------------------------- Upstream calls -------------------------- */
async function askKB(baseUrl: string, question: string, topK?: string | number) {
  const qs = new URLSearchParams({
    question: String(question),
    ...(topK ? { topK: String(topK) } : {})
  }).toString();
  const url = `${baseUrl}/api/Pottery/query?${qs}`;
  const r = await fetchWithTimeout(url, { method: 'GET', headers: { accept: 'application/json' } }, KB_TIMEOUT_MS);
  const text = await r.text();

  let json: any; try { json = JSON.parse(text); } catch { json = text; }
  if (!r.ok) {
    throw new Error((json && (json.error || json.message)) || text || 'KB upstream error');
  }

  return {
    answer: typeof json === 'object' ? (json?.answer ?? '') : (typeof json === 'string' ? json : ''),
    matches: (typeof json === 'object' && Array.isArray(json?.matches)) ? json.matches : []
  };
}

async function askConversation(baseUrl: string, question: string, userId?: string) {
  const params = new URLSearchParams({ question: String(question) });
  if (userId) params.set('userId', String(userId));
  const url = `${baseUrl}/api/Conversation/ask?${params.toString()}`;
  const r = await fetchWithTimeout(url, { method: 'GET', headers: { accept: 'application/json' } }, CONV_TIMEOUT_MS);
  const text = await r.text();

  let json: any; try { json = JSON.parse(text); } catch { json = { answer: text }; }
  if (!r.ok) throw new Error(json?.error || text || 'Conversation upstream error');

  return {
    answer: stripArtifacts(json?.answer || ''),
    confidence: typeof json?.confidence === 'number' ? json.confidence : undefined,
    suggestedQuestions: Array.isArray(json?.suggestedQuestions) ? json.suggestedQuestions : []
  };
}

/* ---------------------------- Intent helpers -------------------------- */
function isConversationalSmallTalk(msg: string): boolean {
  const s = (msg || '').toLowerCase().trim();
  if (s.length > 40) return false;
  return /\b(hi|hello|hey|yo|sup|how are you|what's up|continue|explain more|talk|chat)\b/.test(s);
}

function kbLooksWeak(answer: string, matches: any[]): boolean {
  if (!answer) return true;
  const a = stripArtifacts(answer).trim();
  if (!a) return true;
  if (looksLikeNoInfo(a)) return true;
  if (a.length < 20 && (!matches || matches.length === 0)) return true;
  return false;
}

/* ------------------------------ Handler ------------------------------- */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, topK, userId } = (req.body || {}) as {
      message?: string;
      topK?: number | string;
      userId?: string;
    };

    if (!message) return res.status(400).json({ error: 'message is required' });

    const mode = inferMode(message);

    // 1) Small-talk or meta-chat → Conversation first
    if (isConversationalSmallTalk(message)) {
      const conv = await askConversation(BASE_URL, message, userId);
      return res.status(200).json({ content: conv.answer || 'Hello! Ask me anything about pottery or ceramics.' });
    }

    // 2) KB-first
    let kb: { answer: string; matches: any[] } | null = null;
    try {
      kb = await askKB(BASE_URL, message, topK);
    } catch (e) {
      // KB failed hard → try Conversation once
      const conv = await askConversation(BASE_URL, message, userId).catch(() => null);
      if (conv?.answer) return res.status(200).json({ content: conv.answer });
      // If conversation also failed, surface the KB error
      return res.status(502).json({ error: (e as Error)?.message || 'Upstream error' });
    }

    const baseAnswer = stripArtifacts(kb.answer || '');
    const matches = Array.isArray(kb.matches) ? kb.matches : [];

    // 3) Confidence gate → fallback to Conversation if weak
    if (kbLooksWeak(baseAnswer, matches)) {
      const conv = await askConversation(BASE_URL, message, userId).catch(() => null);
      const convAnswer = stripArtifacts(conv?.answer || '');
      if (convAnswer) {
        return res.status(200).json({ content: convAnswer });
      }
      // salvage from matches or nudge
      if (mode === 'medium' || mode === 'long') {
        const salvage = composeMedium('', matches);
        return res.status(200).json({
          content: salvage || 'We couldn’t find enough on that. Try a related term like “cone 6 firing schedule”, “oxidation vs reduction”, or “bisque firing steps”.'
        });
      }
      return res.status(200).json({ content: 'We couldn’t find enough on that topic. Try rephrasing your question.' });
    }

    // 4) Compose from KB (respect mode)
    let content = '';
    if (mode === 'short') {
      content = composeShort(baseAnswer);
    } else if (mode === 'medium') {
      content = composeMedium(baseAnswer, matches);
    } else {
      content = composeLong(message, baseAnswer, matches);
    }

    // 5) Final polish
    content = applyThhHeadings(content).replace(/\n{3,}/g, '\n\n').trim();
    return res.status(200).json({ content });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
