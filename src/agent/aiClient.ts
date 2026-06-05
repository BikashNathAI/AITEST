/**
 * AI CLIENT — works with Groq (free), OpenAI, or Ollama
 * Switch provider by changing .env — no code change needed
 */
import * as dotenv from 'dotenv';
dotenv.config();

export interface AIMessage {
  role:    'system' | 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  text:     string;
  model:    string;
  provider: string;
  tokens:   number;
}

// ── Groq client (free) ─────────────────────────────
async function callGroq(messages: AIMessage[], model: string): Promise<AIResponse> {
  const Groq   = (await import('groq-sdk')).default;
  const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  const res = await client.chat.completions.create({
    model,
    temperature: 0,
    messages,
  });

  return {
    text:     res.choices[0].message.content ?? '',
    model,
    provider: 'groq',
    tokens:   res.usage?.total_tokens ?? 0,
  };
}

// ── OpenAI client (paid) ───────────────────────────
async function callOpenAI(messages: AIMessage[], model: string): Promise<AIResponse> {
  const OpenAI = (await import('openai')).default;
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const res = await client.chat.completions.create({
    model,
    temperature: 0,
    messages,
  });

  return {
    text:     res.choices[0].message.content ?? '',
    model,
    provider: 'openai',
    tokens:   res.usage?.total_tokens ?? 0,
  };
}

// ── Ollama client (free, local) ────────────────────
async function callOllama(messages: AIMessage[], model: string): Promise<AIResponse> {
  const res = await fetch('http://localhost:11434/api/chat', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ model, messages, stream: false }),
  });

  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json() as { message: { content: string } };

  return {
    text:     data.message.content,
    model,
    provider: 'ollama',
    tokens:   0,
  };
}

// ── Main function — auto-selects provider from .env ─
export async function callAI(
  messages: AIMessage[],
  options:  { jsonMode?: boolean } = {},
): Promise<AIResponse> {
  const provider = process.env.LLM_PROVIDER ?? 'groq';
  const model    = process.env.LLM_MODEL    ?? 'llama-3.3-70b-versatile';

  console.log(`[AI] Using ${provider} / ${model}`);

  switch (provider) {
    case 'groq':   return callGroq(messages, model);
    case 'openai': return callOpenAI(messages, model);
    case 'ollama': return callOllama(messages, model);
    default: throw new Error(`Unknown provider: ${provider}`);
  }
}

// ── Convenience: single user message ──────────────
export async function ask(
  userMessage:   string,
  systemMessage: string = 'You are a helpful AI assistant.',
): Promise<string> {
  const res = await callAI([
    { role: 'system', content: systemMessage },
    { role: 'user',   content: userMessage },
  ]);
  return res.text;
}