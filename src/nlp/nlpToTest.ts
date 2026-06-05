/**
 * NLP → TEST PIPELINE
 * ─────────────────────────────────────────────────────
 * Full pipeline:
 * Plain English → Parse Intent → Generate Playwright code → Save file
 *
 * This is the core of the AI-native framework.
 * Usage: npx tsx src/nlp/nlpToTest.ts "your instruction here"
 */
import { parseIntent, isConfident, getClarification } from './intentParser';
import { callAI }       from '../agent/aiClient';
import { logger }       from '../reporting/logger';
import { ParsedIntent } from './intentSchema';
import * as fs          from 'fs';
import * as path        from 'path';
import * as dotenv      from 'dotenv';
dotenv.config();

// ── Step 2: Generate Playwright code from intent ────
async function generateFromIntent(intent: ParsedIntent): Promise<string> {
  logger.info('[NLP] Generating Playwright code from intent');

  const response = await callAI([
    {
      role: 'system',
      content: `You are a Playwright TypeScript expert.
Generate a complete runnable Playwright test file from a parsed intent object.

CRITICAL RULES — every rule fixes a real confirmed bug:

LOCATOR RULES:
1. NEVER use page.fill(locator, value) — always use locator.fill(value)
2. NEVER use await inside another call's arguments
3. Correct: await page.getByPlaceholder('Your email').fill('value')
4. Wrong:   await page.fill(await page.getByPlaceholder('Your email'), 'value')
5. Correct: await page.getByRole('button', { name: 'Login' }).click()
6. Wrong:   await page.click(await page.getByRole('button', { name: 'Login' }))

NAVIGATION RULES:
7. Always navigate to FULL URL: await page.goto('https://practicesoftwaretesting.com/auth/login')
8. After goto add: await page.getByPlaceholder('Your email').waitFor({ state: 'visible', timeout: 15000 })
9. NEVER use process.env.BASE_URL — use the full hardcoded URL

ASSERTION RULES:
10. Failure message is SECOND arg to expect(): expect(locator, 'message').toBeVisible()
11. NEVER: expect(locator).toBeVisible('message') — message inside is wrong
12. For URL: await expect(page, 'message').toHaveURL(/pattern/, { timeout: 10000 })
13. NEVER: expect(page.url()).toContain() — always use expect(page).toHaveURL()
14. page.title() is async — always: const title = await page.title()

STRUCTURE RULES:
15. NEVER import dotenv — not needed
16. Use test.describe() wrapping all tests
17. Use test.beforeEach() for navigation
18. After form submit click add: await page.waitForTimeout(3000)
19. Return ONLY TypeScript code — no markdown, no backticks, no explanation`,
    },
    {
      role: 'user',
      content: `Generate a complete Playwright TypeScript test file for this intent:

${JSON.stringify(intent, null, 2)}

App: https://practicesoftwaretesting.com
Login page: https://practicesoftwaretesting.com/auth/login
Valid credentials: customer@practicesoftwaretesting.com / welcome01

CONFIRMED WORKING SELECTORS — use exactly these:
- Email input:    page.getByPlaceholder('Your email')
- Password input: page.getByPlaceholder('Your password')
- Login button:   page.getByRole('button', { name: 'Login' })
- Search box:     page.getByPlaceholder('Search')
- Nav links:      page.locator('nav a').first()

After valid login, URL contains: /account
After invalid login, URL stays on: /auth/login`,
    },
  ]);

  return response.text.replace(/```typescript|```ts|```/g, '').trim();
}

// ── Full pipeline ───────────────────────────────────
export async function nlpToTest(
  instruction: string,
  outputPath:  string,
): Promise<{ intent: ParsedIntent; code: string }> {

  console.log('\n📝 Instruction:', instruction);
  console.log('─'.repeat(55));

  // Step 1: Parse intent
  console.log('\n🔍 Step 1: Parsing intent...');
  const intent = await parseIntent(instruction);

  console.log('\nParsed Intent:');
  console.log(`  Action     : ${intent.action}`);
  console.log(`  Domain     : ${intent.domain}`);
  console.log(`  Element    : ${intent.target_element.description}`);
  console.log(`  Expected   : ${intent.expected_outcome}`);
  console.log(`  Confidence : ${(intent.confidence * 100).toFixed(0)}%`);
  console.log(`  Test type  : ${intent.test_type}`);
  if (intent.ambiguities.length > 0) {
    console.log(`  Ambiguous  : ${intent.ambiguities.join(', ')}`);
  }

  // Step 2: Check confidence — halt if too low
  if (!isConfident(intent)) {
    const question = getClarification(intent);
    console.log(`\n⚠️  Confidence too low (${(intent.confidence * 100).toFixed(0)}%)`);
    console.log(`❓ Please clarify: ${question}`);
    throw new Error(`Low confidence (${intent.confidence}): ${question}`);
  }

  console.log(`\n✅ Confidence OK (${(intent.confidence * 100).toFixed(0)}%) — proceeding`);

  // Step 3: Generate Playwright code
  console.log('\n🤖 Step 2: Generating Playwright test code...');
  const code = await generateFromIntent(intent);

  // Step 4: Save file
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, code, 'utf-8');

  console.log(`\n✅ Test saved → ${outputPath}`);
  console.log('\n' + '─'.repeat(55));
  console.log(code);
  console.log('─'.repeat(55));

  return { intent, code };
}

// ── CLI ─────────────────────────────────────────────
if (require.main === module) {
  const instruction = process.argv[2] ?? 'verify the login button is visible on the login page';
  const outputPath  = process.argv[3] ?? 'tests/ui/nlp-generated.spec.ts';

  console.log('\n🤖 NLP → Test Pipeline (FREE via Groq)\n');

  nlpToTest(instruction, outputPath)
    .then(() => {
      console.log('\n🎉 Pipeline complete!');
      console.log(`\nNext — run the test:`);
      console.log(`  npx playwright test ${outputPath} --headed --project=chromium`);
    })
    .catch(err => {
      console.error('\n❌ Pipeline failed:', err.message);
      process.exit(1);
    });
}