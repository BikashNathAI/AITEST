import { test, expect } from '@playwright/test';

const LOGIN_URL = 'https://practicesoftwaretesting.com/auth/login';
const EMAIL     = 'customer@practicesoftwaretesting.com';
const PASSWORD  = 'welcome01';

test.describe('Login Page Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_URL);
    await page.getByPlaceholder('Your email')
              .waitFor({ state: 'visible', timeout: 15000 });
  });

  test('TC-AI-001 | form elements are visible', async ({ page }) => {
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

    console.log('✅ TC-AI-001 passed');
  });

  test('TC-AI-002 | valid login → redirects to account', async ({ page }) => {
    await page.getByPlaceholder('Your email').fill(EMAIL);
    await page.getByPlaceholder('Your password').fill(PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(3000);

    await expect(
      page,
      'Should redirect to account after valid login',
    ).toHaveURL(/account|dashboard/, { timeout: 10000 });

    console.log('✅ TC-AI-002 passed — URL:', page.url());
  });

  test('TC-AI-003 | invalid login → stays on login page', async ({ page }) => {
    await page.getByPlaceholder('Your email').fill('invalid@example.com');
    await page.getByPlaceholder('Your password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(3000);

    const url = page.url();
    expect(
      url.includes('login') || url.includes('auth'),
      `Should stay on login page, got: ${url}`,
    ).toBeTruthy();

    console.log('✅ TC-AI-003 passed');
  });

  test('TC-AI-004 | page title is set', async ({ page }) => {
    const title = await page.title();   // must await — title() is async
    expect(title, 'Title must not be empty').toBeTruthy();
    console.log('✅ TC-AI-004 passed — title:', title);
  });

});