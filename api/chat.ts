// /api/chat.ts - Hybrid System: Pottery Knowledge + Conversational AI
import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_URL = (process.env.PRIVATE_API_BASE_URL || 'http://glazeon.somee.com').replace(/\/+$/, '');

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, conversationHistory, topK } = (req.body || {}) as {
      message?: string;
      conversationHistory?: ChatMessage[];
      topK?: number | string;
    };

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    // STEP 1: Always try to get pottery knowledge first
    const potteryKnowledge = await getPotteryKnowledge(message, topK);
    
    // STEP 2: Decide if we need conversational AI enhancement
    const needsConversationalAI = shouldUseConversationalAI(message, potteryKnowledge);

    if (!needsConversationalAI && potteryKnowledge.hasGoodMatch) {
      // Return pure pottery knowledge (like your current system)
      return res.status(200).json({ 
        content: potteryKnowledge.formattedAnswer,
        source: 'pottery_database'
      });
    }

    // STEP 3: Use conversational AI with pottery context
    const conversationalResponse = await getConversationalResponse(
      message, 
      conversationHistory || [], 
      potteryKnowledge
    );

    return res.status(200).json({ 
      content: conversationalResponse,
      source: 'hybrid'
    });

  } catch (err) {
    console.error('Hybrid chat error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}

// Get knowledge from your pottery database
async function getPotteryKnowledge(question: string, topK?: number | string) {
  try {
    const qs = new URLSearchParams({
      question: String(question),
      ...(topK ? { topK: String(topK) } : {})
    }).toString();
    
    const url = `${BASE_URL}/api/Pottery/query?${qs}`;
    const response = await fetch(url, { method: 'GET' });
    const text = await response.text();
    
    let json: any;
    try { json = JSON.parse(text); } catch { json = text; }
    
    if (!response.ok) {
      return { hasGoodMatch: false, answer: '', matches: [], formattedAnswer: '' };
    }

    const answer = json?.answer || '';
    const matches = json?.matches || [];
    
    // Determine if this is a "good match" based on content quality
    const hasGoodMatch = answer && 
      answer.length > 50 && 
      !answer.toLowerCase().includes('no relevant') &&
      matches.length > 0;

    return {
      hasGoodMatch,
      answer,
      matches,
      formattedAnswer: formatPotteryAnswer(question, answer, matches),
      raw: json
    };
  } catch (err) {
    return { hasGoodMatch: false, answer: '', matches: [], formattedAnswer: '' };
  }
}

// Decide if we need conversational AI
function shouldUseConversationalAI(question: string, potteryKnowledge: any): boolean {
  const q = question.toLowerCase();
  
  // Use conversational AI for:
  
  // 1. Personal/emotional questions
  if (/\b(i|my|me|help|advice|recommend|suggest|think|feel|beginner|start|confused|frustrated|excited)\b/.test(q)) {
    return true;
  }
  
  // 2. Comparison questions
  if (/\b(vs|versus|better|best|compare|difference|which|what should)\b/.test(q)) {
    return true;
  }
  
  // 3. Troubleshooting (specific problems)
  if (/\b(why|what went wrong|problem|issue|failed|cracked|broke|help|fix)\b/.test(q)) {
    return true;
  }
  
  // 4. Planning/advice questions
  if (/\b(plan|planning|setup|studio|budget|buy|purchase|first|start)\b/.test(q)) {
    return true;
  }
  
  // 5. If pottery knowledge didn't find good matches
  if (!potteryKnowledge.hasGoodMatch) {
    return true;
  }
  
  // Otherwise, pure pottery knowledge is fine
  return false;
}

// Format pottery knowledge (your existing logic simplified)
function formatPotteryAnswer(question: string, answer: string, matches: any[]): string {
  // Your existing formatting logic here
  const mode = question.split(/\s+/).length <= 3 ? 'medium' : 'long';
  
  if (mode === 'medium') {
    return answer; // Simple answer
  } else {
    // Create structured response with matches
    return `### **Overview**\n\n${answer}\n\n### **Key Points**\n\n${
      matches.slice(0, 5).map(m => `- ${m.lede || m.description?.substring(0, 100) + '...'}`).join('\n')
    }`;
  }
}

// Get conversational AI response
async function getConversationalResponse(
  message: string, 
  history: ChatMessage[], 
  potteryKnowledge: any
): Promise<string> {
  
  const apiKey = process.env.OPENROUTER_API_KEY; // You'll need this
  if (!apiKey) {
    // Fallback to pottery knowledge if no AI API key
    return potteryKnowledge.formattedAnswer || "I can help with pottery terms and techniques. Try asking about specific pottery concepts!";
  }

  // Build conversation context
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are Master Ceramics, a friendly and knowledgeable pottery expert from GlazionStudio. 

Your personality:
- Warm, encouraging, and supportive
- Expert in ceramics, glazes, firing, and pottery techniques
- Help beginners and experienced potters alike
- Provide practical, actionable advice

${potteryKnowledge.hasGoodMatch ? 
  `IMPORTANT: I found relevant information in our pottery database:
  
  Answer: ${potteryKnowledge.answer}
  
  Additional Details: ${potteryKnowledge.matches.slice(0, 3).map((m: any) => `- ${m.title}: ${m.lede || m.description?.substring(0, 150)}`).join('\n')}
  
  Use this information as the foundation of your response, but enhance it with conversational context, personal advice, and encouragement as appropriate.` 
  : 
  'No specific pottery database match found. Provide helpful pottery advice based on your general knowledge.'
}`
    },
    
    // Add conversation history (last 6 messages to keep context manageable)
    ...history.slice(-6),
    
    // Current user message
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.PUBLIC_URL || 'https://glazeon-craft-ai.vercel.app/',
        'X-Title': 'GlazionStudio Hybrid Chat',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet', // or your preferred model
        messages,
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.choices?.[0]?.message?.content || 'Sorry, I had trouble generating a response.';
    
  } catch (err) {
    console.error('Conversational AI error:', err);
    // Fallback to pottery knowledge
    return potteryKnowledge.formattedAnswer || "I'm having trouble with my conversational features right now, but I can still help with pottery terms and techniques!";
  }
}