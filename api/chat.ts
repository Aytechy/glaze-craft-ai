// /api/chat.ts — Smart Router: Knowledge Base + Conversational AI
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');

/* -------------------- Intent: short / medium / long -------------------- */
type Mode = 'short' | 'medium' | 'long';
type RouteDecision = 'knowledge' | 'conversation' | 'hybrid';

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

// NEW: Smart routing decision
function decideRoute(question: string): RouteDecision {
  const q = question.toLowerCase();

  // Use CONVERSATION AI for:
  
  // 1. Personal/beginner questions
  if (/\b(i|my|me|help|advice|recommend|suggest|beginner|start|confused|frustrated|excited|new to|first time)\b/.test(q)) {
    return 'conversation';
  }
  
  // 2. Troubleshooting (problems)
  if (/\b(why|what went wrong|problem|issue|failed|cracked|broke|help|fix|broken|not working)\b/.test(q)) {
    return 'conversation';
  }
  
  // 3. Comparison and choice questions
  if (/\b(vs|versus|better|best|compare|difference|which|what should|choose|pick|decide)\b/.test(q)) {
    return 'conversation';
  }
  
  // 4. Planning/setup questions
  if (/\b(plan|planning|setup|studio|budget|buy|purchase|getting started|how do i start)\b/.test(q)) {
    return 'conversation';
  }

  // 5. Greeting/casual
  if (/\b(hi|hello|hey|thanks|thank you|please|can you|could you)\b/.test(q)) {
    return 'conversation';
  }
  
  // Use KNOWLEDGE BASE for:
  // - Factual definitions: "What is cone 6", "bisque firing temperature"
  // - Technical terms: "oxidation", "reduction", "earthenware"
  // - Specific pottery vocabulary
  
  return 'knowledge';
}

/* --------------------------- Text utilities (UNCHANGED) --------------------------- */
function normalizeWhitespace(t: string): string {
  return (t || '').replace(/\s+/g, ' ').trim();
}

function stripArtifacts(t: string): string {
  if (!t) return '';
  let s = t
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\u00A0/g, ' ')
    .replace(/\*{3,}/g, '**')
    .trim();

  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (s.startsWith('**') && s.endsWith('**')) {
    s = s.slice(2, -2).trim();
  }
  s = s.replace(/^\*+/, '').replace(/\*+$/, '').trim();

  s = s.replace(
    /(No relevant [^.]*? found\. Please try rephrasing your question\.)\s*\1+/gi,
    '$1'
  );

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

function applyThhHeadings(text: string): string {
  return (text || '').replace(/\bThh\b\s*([^\n.]+)\.?/g, (_, h) => `\n\n### **${String(h).trim()}**\n\n`);
}

function bulletify(list: string[]): string {
  return list.map(s => `- ${s}`).join('\n');
}

/* ----------------------- Composition (by mode) - UNCHANGED ------------------------ */
function composeShort(answer: string): string {
  return stripArtifacts(answer);
}

function composeMedium(answer: string, matches: any[]): string {
  const base = stripArtifacts(answer);
  const picked: string[] = [];

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
  return `${base}\n\n${bulletify(picked)}`;
}

function composeLong(question: string, answer: string, matches: any[]): string {
  const procedural = /\b(how|how to|guide|tutorial|technique|techniques|steps|process|build|make|recipe|schedule|troubleshoot|fix|prevent|best practices)\b/i.test(question);
  const base = stripArtifacts(answer);

  const overview = base || (splitSentences(stripArtifacts(matches?.[0]?.description || '')).shift() || '');

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

  pushSentences(base);

  const elaborations: string[] = [];
  for (const m of matches || []) {
    const title = stripArtifacts(m?.title || '');
    const lede = stripArtifacts(m?.lede || '');
    const desc = stripArtifacts(m?.description || '');

    if (title) elaborations.push(`**${title}**`);
    if (lede) pushSentences(lede);
    if (desc) pushSentences(desc);
  }

  const deStep = dedupeSentences(stepLike);
  const dePoints = dedupeSentences(keyPoints);
  const deElabs = dedupeSentences(elaborations);

  let out: string[] = [];

  if (overview) {
    out.push(`### **Overview**\n\n${overview}`);
  }

  if (procedural && deStep.length) {
    out.push(`### **Key Steps**\n\n${bulletify(deStep)}`);
  }

  if (!procedural && dePoints.length) {
    out.push(`### **Key Points**\n\n${bulletify(dePoints)}`);
  } else if (procedural && dePoints.length) {
    out.push(`### **Notes & Parameters**\n\n${bulletify(dePoints)}`);
  }

  if (deElabs.length) {
    out.push(`### **Related Topics**\n\n${bulletify(deElabs)}`);
  }

  let result = out.join('\n\n');
  result = applyThhHeadings(result);

  result = result
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return result || stripArtifacts(answer);
}

/* -------------------- NEW: API Callers -------------------- */

// Call knowledge base (your existing pottery database)
async function getKnowledgeResponse(question: string, topK?: number | string) {
  try {
    const qs = new URLSearchParams({
      question: String(question),
      ...(topK ? { topK: String(topK) } : {})
    }).toString();
    const url = `${BASE_URL}/api/Pottery/query?${qs}`;

    const upstream = await fetch(url, { method: 'GET' });
    const text = await upstream.text();

    let json: any; 
    try { json = JSON.parse(text); } catch { json = text; }
    
    if (!upstream.ok) {
      return { success: false, error: (json && (json.error || json.message)) || text || 'Knowledge base error' };
    }

    const baseAnswerRaw = typeof json === 'object' ? (json?.answer ?? '') : (typeof json === 'string' ? json : '');
    const baseAnswer = stripArtifacts(baseAnswerRaw);
    const matches = (typeof json === 'object' && Array.isArray(json?.matches)) ? json.matches : [];

    return {
      success: true,
      answer: baseAnswer,
      matches,
      hasGoodMatch: baseAnswer && baseAnswer.length > 50 && !looksLikeNoInfo(baseAnswer) && matches.length > 0
    };
  } catch (error) {
    return { success: false, error: 'Knowledge base connection error' };
  }
}

// Call conversation AI
async function getConversationResponse(question: string) {
  try {
    const qs = new URLSearchParams({ question: String(question) }).toString();
    const url = `${BASE_URL}/api/Conversation/ask?${qs}`;

    const upstream = await fetch(url, { method: 'GET' });
    
    if (!upstream.ok) {
      return { success: false, error: `Conversation API error: ${upstream.status}` };
    }

    const json = await upstream.json();
    
    return {
      success: json.success || false,
      answer: json.answer || '',
      confidence: json.confidence || 0,
      suggestedQuestions: json.suggestedQuestions || []
    };
  } catch (error) {
    return { success: false, error: 'Conversation API connection error' };
  }
}

/* ------------------------------ SMART ROUTER HANDLER ------------------------------- */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { message, topK } = (req.body || {}) as {
      message?: string;
      topK?: number | string;
    };

    if (!message) return res.status(400).json({ error: 'message is required' });

    // Step 1: Decide routing strategy
    const route = decideRoute(message);
    const mode = inferMode(message);

    let content = '';
    let suggestedQuestions: string[] = [];
    let source = '';

    if (route === 'conversation') {
      // Use conversation AI
      const convResponse = await getConversationResponse(message);
      
      if (convResponse.success && convResponse.answer) {
        content = stripArtifacts(convResponse.answer);
        suggestedQuestions = convResponse.suggestedQuestions || [];
        source = 'conversation';
      } else {
        // Fallback to knowledge base
        const knowledgeResponse = await getKnowledgeResponse(message, topK);
        
        if (knowledgeResponse.success) {
          const isNoInfo = looksLikeNoInfo(knowledgeResponse.answer);
          
          if (mode === 'short') {
            content = knowledgeResponse.answer || 'We couldn\'t find enough on that topic. Try a related term.';
          } else if (mode === 'medium') {
            content = !isNoInfo ? composeMedium(knowledgeResponse.answer, knowledgeResponse.matches) : 
                     (knowledgeResponse.matches?.length ? composeMedium('', knowledgeResponse.matches) : 
                     'We couldn\'t find enough on that topic. Try a related term.');
          } else { // long
            content = !isNoInfo ? composeLong(message, knowledgeResponse.answer, knowledgeResponse.matches) : 
                     (knowledgeResponse.matches?.length ? composeLong(message, '', knowledgeResponse.matches) : 
                     'We couldn\'t find enough on that topic. Try asking about specific techniques or materials.');
          }
          source = 'knowledge_fallback';
        } else {
          content = 'I\'m having trouble accessing my systems right now. Please try again in a moment.';
          source = 'error';
        }
      }
    } else {
      // Use knowledge base (your original excellent system)
      const knowledgeResponse = await getKnowledgeResponse(message, topK);
      
      if (knowledgeResponse.success) {
        const isNoInfo = looksLikeNoInfo(knowledgeResponse.answer);
        
        if (mode === 'short') {
          content = composeShort(knowledgeResponse.answer);
          if (!content && knowledgeResponse.matches?.length) {
            const first = splitSentences(stripArtifacts(knowledgeResponse.matches[0]?.description || knowledgeResponse.matches[0]?.lede || '')).shift() || '';
            content = first || 'We couldn\'t find enough on that topic. Try a related term.';
          }
        } else if (mode === 'medium') {
          if (!isNoInfo) {
            content = composeMedium(knowledgeResponse.answer, knowledgeResponse.matches);
          } else if (knowledgeResponse.matches?.length) {
            content = composeMedium('', knowledgeResponse.matches);
          } else {
            content = 'We couldn\'t find enough on that topic. Try a related term like "cone 6 firing schedule", "oxidation vs reduction", or "bisque firing steps".';
          }
        } else { // long
          if (!isNoInfo) {
            content = composeLong(message, knowledgeResponse.answer, knowledgeResponse.matches);
          } else if (knowledgeResponse.matches?.length) {
            content = composeLong(message, '', knowledgeResponse.matches);
          } else {
            content = 'We couldn\'t find enough on that topic. Try: techniques, schedules, materials, or defects related to your query.';
          }
        }
        source = 'knowledge';
      } else {
        // Fallback to conversation AI
        const convResponse = await getConversationResponse(message);
        
        if (convResponse.success && convResponse.answer) {
          content = stripArtifacts(convResponse.answer);
          suggestedQuestions = convResponse.suggestedQuestions || [];
          source = 'conversation_fallback';
        } else {
          content = 'I\'m having trouble accessing my systems right now. Please try again in a moment.';
          source = 'error';
        }
      }
    }

    // Final polish
    content = applyThhHeadings(content).replace(/\n{3,}/g, '\n\n').trim();

    // Return response (include suggested questions if available)
    const response: any = { content, source };
    if (suggestedQuestions.length > 0) {
      response.suggestedQuestions = suggestedQuestions;
    }

    return res.status(200).json(response);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Server error' });
  }
}