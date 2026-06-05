import { Page }  from '@playwright/test';
import { callAI } from '../agent/aiClient';
import { logger } from '../reporting/logger';
import * as dotenv from 'dotenv';
dotenv.config();

export async function findElement(
  page:        Page,
  description: string,
  selectors:   string[],
): Promise<{ selector: string; healed: boolean }> {

  // Try original selectors first
  for (const sel of selectors) {
    try {
      await page.locator(sel).waitFor({ state: 'visible', timeout: 3000 });
      logger.info('[Healer] Found with original selector', { sel });
      return { selector: sel, healed: false };
    } catch {
      logger.warn('[Healer] Selector failed', { sel });
    }
  }

  // All failed → AI healing
  logger.warn('[Healer] Invoking AI healer', { description });
  return await aiHeal(page, description);
}

async function aiHeal(
  page:        Page,
  description: string,
): Promise<{ selector: string; healed: boolean }> {

  // Capture DOM snapshot
  const domData = await page.evaluate(() => {
    const els = document.querySelectorAll(
      'button, input, a, select, [data-testid], [role="button"]'
    );
    return Array.from(els).slice(0, 50).map(el => ({
      tag:         el.tagName.toLowerCase(),
      id:          el.id || null,
      testid:      el.getAttribute('data-testid'),
      type:        el.getAttribute('type'),
      text:        el.textContent?.trim().slice(0, 50),
      placeholder: el.getAttribute('placeholder'),
      ariaLabel:   el.getAttribute('aria-label'),
    }));
  });

  const response = await callAI([
    {
      role: 'system',
      content: 'You are a Playwright selector expert. Return ONLY valid JSON, no explanation.',
    },
    {
      role: 'user',
      content: `Find a Playwright selector for: "${description}"

DOM elements on page:
${JSON.stringify(domData, null, 2)}

Return ONLY this JSON:
{
  "selector": "playwright locator string",
  "confidence": 0.0-1.0,
  "reasoning": "brief reason"
}`,
    },
  ]);

  const clean = response.text.replace(/```json|```/g, '').trim();

  let result: { selector: string; confidence: number; reasoning: string };
  try {
    result = JSON.parse(clean);
  } catch {
    throw new Error(`[Healer] AI returned invalid JSON: ${response.text}`);
  }

  logger.info('[Healer] AI healed selector', {
    selector:   result.selector,
    confidence: result.confidence,
    reasoning:  result.reasoning,
  });

  if (result.confidence < 0.5)
    throw new Error(`[Healer] Low confidence: ${result.confidence}`);

  return { selector: result.selector, healed: true };
}