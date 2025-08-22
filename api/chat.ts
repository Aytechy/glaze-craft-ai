// /api/chat.ts — intent-driven formatter. Returns ONLY { content }.
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');

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

/* ------------------------------ Handler ------------------------------- */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, topK } = (req.body || {}) as {
      message?: string;
      topK?: number | string;
    };

    if (!message) return res.status(400).json({ error: 'message is required' });

    // Decide mode from the *question intent* (not word count)
    const mode = inferMode(message);

    // Call backend
    const qs = new URLSearchParams({
      question: String(message),
      ...(topK ? { topK: String(topK) } : {})
    }).toString();
    const url = `${BASE_URL}/api/Pottery/query?${qs}`;

    const upstream = await fetch(url, { method: 'GET' });
    const text = await upstream.text();

    let json: any; try { json = JSON.parse(text); } catch { json = text; }
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: (json && (json.error || json.message)) || text || 'Upstream error' });
    }

    const baseAnswerRaw = typeof json === 'object' ? (json?.answer ?? '') : (typeof json === 'string' ? json : '');
    const baseAnswer = stripArtifacts(baseAnswerRaw);
    const matches = (typeof json === 'object' && Array.isArray(json?.matches)) ? json.matches : [];

    // If backend says "no relevant … found", try to compose from matches anyway
    const isNoInfo = looksLikeNoInfo(baseAnswer);
    let content = '';

    if (mode === 'short') {
      // STRICT: show answer field only (cleaned)
      content = baseAnswer;
      if (!content && matches.length) {
        // Fallback minimal: first clear sentence we can find
        const first = splitSentences(stripArtifacts(matches[0]?.description || matches[0]?.lede || '')).shift() || '';
        content = first || 'We couldn’t find enough on that topic. Try a related term.';
      }
    } else if (mode === 'medium') {
      if (!isNoInfo) {
        content = composeMedium(baseAnswer, matches);
      } else if (matches.length) {
        // salvage from matches
        content = composeMedium('', matches);
      } else {
        content = 'We couldn’t find enough on that topic. Try a related term like “cone 6 firing schedule”, “oxidation vs reduction”, or “bisque firing steps”.';
      }
    } else { // long
      if (!isNoInfo) {
        content = composeLong(message, baseAnswer, matches);
      } else if (matches.length) {
        content = composeLong(message, '', matches);
      } else {
        content = 'We couldn’t find enough on that topic. Try: techniques, schedules, materials, or defects related to your query.';
      }
    }

    // Final polish: keep paragraphs and markdown intact; ensure no mid-sentence truncation occurs (we never slice strings in the composers).
    content = applyThhHeadings(content).replace(/\n{3,}/g, '\n\n').trim();

    // If user asked a head term like “brick making” and backend repeated noisy fragments,
    // our dedupe + composition prevents cut-offs and duplication naturally.

    return res.status(200).json({ content });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}
