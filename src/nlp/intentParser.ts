/**
 * INTENT PARSER
 * Takes plain English instruction → structured ParsedIntent
 * Uses free Groq AI — no cost
 */
import { callAI }      from '../agent/aiClient';
import { logger }      from '../reporting/logger';
import {
  ParsedIntent,
  MIN_CONFIDENCE,
} from './intentSchema';

const SYSTEM = `You are a test automation intent parser.
Parse natural language test instructions into structured JSON.
Return ONLY valid JSON — no explanation, no markdown, no backticks.

ACTION values: navigate, click, fill, assert, extract, wait, hover, upload, api_call
DOMAIN values: auth, product, cart, checkout, admin, api, other
PRIORITY values: p0 (critical), p1 (important), p2 (nice to have)
TEST_TYPE values: ui, api, database, e2e
CONFIDENCE: 1.0 if everything is explicit, subtract 0.1 per ambiguity

SELECTOR HINTS:
- If element has data-testid → use "testid"
- If button/link/input by name → use "role"  
- If input by placeholder → use "placeholder"
- If identified by visible text → use "text"
- Otherwise → use "css"`;

export async function parseIntent(instruction: string): Promise<ParsedIntent> {
  logger.info('[NLP] Parsing instruction', { instruction });

  const response = await callAI([
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Parse this test instruction into JSON:

"${instruction}"

Return this exact JSON structure:
{
  "action": "assert",
  "target_url": null,
  "target_element": {
    "description": "what element to interact with",
    "selector_hint": "role",
    "value": null
  },
  "expected_outcome": "what should happen",
  "preconditions": [],
  "domain": "auth",
  "priority": "p1",
  "test_type": "ui",
  "confidence": 0.9,
  "ambiguities": [],
  "raw_instruction": "${instruction}"
}`,
    },
  ]);

  // Clean and parse JSON
  const clean = response.text
    .replace(/```json|```/g, '')
    .trim();

  let intent: ParsedIntent;
  try {
    intent = JSON.parse(clean) as ParsedIntent;
  } catch {
    throw new Error(`[NLP] AI returned invalid JSON: ${response.text.slice(0, 200)}`);
  }

  logger.info('[NLP] Intent parsed', {
    action:     intent.action,
    domain:     intent.domain,
    confidence: intent.confidence,
  });

  return intent;
}

// Check if confidence is high enough to proceed
export function isConfident(intent: ParsedIntent): boolean {
  return intent.confidence >= MIN_CONFIDENCE;
}

// Get clarifying question for low confidence
export function getClarification(intent: ParsedIntent): string {
  if (intent.ambiguities.length === 0) {
    return 'Please provide more details about the target element or expected outcome.';
  }
  return `Please clarify: ${intent.ambiguities[0]}`;
}