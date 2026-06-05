import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/playwright/LoginPage';

test.describe('Login Tests', () => {

  // ── TC-001: Happy path ─────────────────────────────
  test('TC-001 | valid login → redirects to account', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.navigate();

    await lp.login(
      'customer@practicesoftwaretesting.com',
      'welcome01',
    );

    await expect(page, 'Should land on account page')
      .toHaveURL(/account/, { timeout: 15000 });

    console.log('✅ TC-001 PASSED — URL:', page.url());
  });

  // ── TC-002: Wrong password ─────────────────────────
  test('TC-002 | wrong password → error shown', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.navigate();

    await lp.login('customer@practicesoftwaretesting.com', 'wrongpass123');

    // Either an error message appears OR page stays on login
    const errorText   = await lp.getErrorText();
    const stillOnLogin = page.url().includes('login');

    console.log('Error text found :', errorText || '(none)');
    console.log('Still on login   :', stillOnLogin);

    expect(
      errorText.length > 0 || stillOnLogin,
      'Expected error message OR to remain on login page',
    ).toBeTruthy();

    console.log('✅ TC-002 PASSED');
  });

  // ── TC-003: Page title ─────────────────────────────
  test('TC-003 | page title is set', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.navigate();

    const title = await page.title();
    expect(title, 'Title must not be empty').toBeTruthy();
    console.log('✅ TC-003 PASSED — title:', title);
  });

  // ── TC-004: Form elements visible ─────────────────
  test('TC-004 | all form elements are visible', async ({ page }) => {
    const lp = new LoginPage(page);
    await lp.navigate();

    await expect(
      page.getByPlaceholder('Your email'),
      'Email input must be visible',
    ).toBeVisible();

    await expect(
      page.getByPlaceholder('Your password'),
      'Password input must be visible',
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: 'Login' }),
      'Login button must be visible',
    ).toBeVisible();

    console.log('✅ TC-004 PASSED — all form elements visible');
  });

});
