import { callAI }  from '../agent/aiClient';
import { logger }  from '../reporting/logger';
import * as fs     from 'fs';
import * as path   from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

/**
 * SYSTEM PROMPT — updated with every mistake we learned from AI
 * Each rule fixes a real bug we saw in generated tests
 */
const SYSTEM = `You are a senior Playwright TypeScript test engineer.
Generate complete runnable Playwright test files.

STRICT RULES — every rule comes from a real bug, follow exactly:

NAVIGATION:
1. In beforeEach always use the FULL URL: await page.goto('https://domain.com/path')
2. NEVER use process.env.BASE_URL concatenation — use full hardcoded URL
3. After page.goto() always add: await page.waitForSelector('input', { state: 'visible', timeout: 15000 })

ASSERTIONS:
4. NEVER use .toBeNull() — use .toBeVisible() instead
5. NEVER use .not.toBeNull() — use .toBeVisible() instead
6. Failure message goes as SECOND argument to expect(): expect(locator, 'message').toBeVisible()
7. NEVER pass message inside assertion options like .toBeVisible({ message }) — this is wrong
8. For URL assertions ALWAYS use: await expect(page).toHaveURL(/pattern/, { timeout: 10000 })
9. NEVER use expect(page.url()).toContain() — always use expect(page).toHaveURL()
10. NEVER use expect(string).toBe() for URLs — use expect(page).toHaveURL()

ASYNC:
11. page.title() returns a Promise — ALWAYS await it: const title = await page.title()
12. After any .click() on a form submit add: await page.waitForTimeout(3000)

STRUCTURE:
13. NEVER import dotenv — playwright.config.ts already loads it
14. NEVER use let page outside tests — always use { page } from test function args
15. Always use: test.describe > test.beforeEach > test()
16. Return ONLY TypeScript code — no markdown, no backticks, no explanation`;

export async function generateTest(
  description: string,
  outputPath:  string,
): Promise<string> {
  logger.info('[TestGen] Generating test', { description });

  const response = await callAI([
    { role: 'system', content: SYSTEM },
    {
      role: 'user',
      content: `Generate a Playwright TypeScript test for:
"${description}"

App URL: https://practicesoftwaretesting.com
Login page: https://practicesoftwaretesting.com/auth/login
Email placeholder: Your email
Password placeholder: Your password
Login button: role=button name=Login
Valid login credentials: customer@practicesoftwaretesting.com / welcome01
After valid login: URL changes to contain /account
After invalid login: URL stays on /auth/login`,
    },
  ]);

  const clean = response.text.replace(/```typescript|```ts|```/g, '').trim();
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, clean, 'utf-8');
  logger.info('[TestGen] Written', { outputPath });
  return clean;
}

// ── CLI usage ─────────────────────────────────────────
if (require.main === module) {
  const desc = process.argv[2] ?? 'Test the login form with valid and invalid credentials';
  const out  = process.argv[3] ?? 'tests/ui/ai-generated.spec.ts';

  console.log('\n🤖 AI Test Generator (FREE via Groq)\n');
  console.log('Prompt:', desc);
  console.log('Output:', out, '\n');

  generateTest(desc, out)
    .then(code => {
      console.log('✅ Generated!\n');
      console.log(code);
      console.log(`\nRun: npx playwright test ${out} --headed`);
    })
    .catch(err => {
      console.error('❌', err.message);
      process.exit(1);
    });
}