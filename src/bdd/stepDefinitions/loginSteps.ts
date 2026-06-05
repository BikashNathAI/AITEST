import { setDefaultTimeout, Given, When, Then, Before, After } from '@cucumber/cucumber';
import { chromium, Browser, Page, expect } from '@playwright/test';
import { LoginPage } from '../../playwright/LoginPage';

// ── Set timeout for ALL hooks and steps to 30 seconds ──
// This MUST be at the top, before any hooks
setDefaultTimeout(30 * 1000);

// ── Shared state ────────────────────────────────────────
let browser:   Browser;
let page:      Page;
let loginPage: LoginPage;

// ── Before each scenario ────────────────────────────────
Before(async () => {
  browser   = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  page      = await ctx.newPage();
  loginPage = new LoginPage(page);
});

// ── After each scenario — always close browser ──────────
After(async () => {
  await browser.close();
});

// ── GIVEN ───────────────────────────────────────────────
Given('I am on the login page', async () => {
  await loginPage.navigate();
});

// ── WHEN ────────────────────────────────────────────────
When('I enter email {string}', async (email: string) => {
  await page.getByPlaceholder('Your email').fill(email);
});

When('I enter password {string}', async (password: string) => {
  await page.getByPlaceholder('Your password').fill(password);
});

When('I click the Login button', async () => {
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForTimeout(4000);
});

// ── THEN ────────────────────────────────────────────────
Then('I should be redirected to the account page', async () => {
  const url = page.url();
  console.log('  → URL after login:', url);
  expect(
    !url.includes('login') && !url.includes('auth'),
    `Expected redirect away from login page. Got: ${url}`,
  ).toBeTruthy();
});

Then('I should see an error message', async () => {
  const url         = page.url();
  const onLoginPage = url.includes('login') || url.includes('auth');
  const errorShown  = await page
    .locator('.alert, .alert-danger, [class*="alert"]')
    .first().isVisible().catch(() => false);

  console.log('  → URL:', url);
  console.log('  → Error visible:', errorShown);
  console.log('  → Still on login:', onLoginPage);

  expect(
    errorShown || onLoginPage,
    'Expected error message or to stay on login page',
  ).toBeTruthy();
});

Then('the email field should be visible', async () => {
  await expect(page.getByPlaceholder('Your email')).toBeVisible();
});

Then('the password field should be visible', async () => {
  await expect(page.getByPlaceholder('Your password')).toBeVisible();
});

Then('the Login button should be visible', async () => {
  await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});