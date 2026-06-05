import { chromium }    from '@playwright/test';
import { findElement } from '../../src/healing/selectorHealer';
import * as dotenv     from 'dotenv';
dotenv.config();

async function runDemo() {
  console.log('\n🤖 Self-Healing Selector Demo (FREE — Groq)\n');

  const browser = await chromium.launch({ headless: false });
  const ctx     = await browser.newContext();
  const page    = await ctx.newPage();

  await page.goto('https://practicesoftwaretesting.com/auth/login');
  await page.waitForLoadState('networkidle');
  console.log('✅ Page loaded\n');

  // ── Test 1: CORRECT selector — should NOT heal ──
  console.log('TEST 1: Correct selector — AI should NOT be called');
  const r1 = await findElement(
    page,
    'email input field',
    ["[placeholder='Your email']"],
  );
  console.log(`  Selector : ${r1.selector}`);
  console.log(`  Healed   : ${r1.healed}`);
  console.log(`  Result   : ${r1.healed ? '🔧 AI healed it' : '✅ Found directly'}\n`);

  // ── Test 2: BROKEN selector — AI should heal ────
  console.log('TEST 2: Broken selector — AI SHOULD heal it');
  const r2 = await findElement(
    page,
    'email input field for login',
    ['#broken-id', '[data-testid="email-broken"]'],
  );
  console.log(`  Selector : ${r2.selector}`);
  console.log(`  Healed   : ${r2.healed}`);
  console.log(`  Result   : ${r2.healed ? '🔧 AI healed it!' : '✅ Found directly'}\n`);

  // ── Test 3: BROKEN selector — AI should heal ────
  console.log('TEST 3: Broken Login button selector — AI SHOULD heal it');
  const r3 = await findElement(
    page,
    'Login submit button',
    ['#submit-broken', '.old-login-btn'],
  );
  console.log(`  Selector : ${r3.selector}`);
  console.log(`  Healed   : ${r3.healed}`);
  console.log(`  Result   : ${r3.healed ? '🔧 AI healed it!' : '✅ Found directly'}\n`);

  await browser.close();
  console.log('🎉 Demo complete!\n');
  console.log('Summary:');
  console.log(`  Test 1 — healed: ${r1.healed} (expected: false)`);
  console.log(`  Test 2 — healed: ${r2.healed} (expected: true)`);
  console.log(`  Test 3 — healed: ${r3.healed} (expected: true)`);
}

runDemo().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});