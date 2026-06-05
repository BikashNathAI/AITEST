import { test, expect } from '@playwright/test';

test.describe('Login Test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://practicesoftwaretesting.com/auth/login');
    await page.getByPlaceholder('Your email').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('Login with valid credentials and verify redirect to account page', async ({ page }) => {
    const emailInput = page.getByPlaceholder('Your email');
    const passwordInput = page.getByPlaceholder('Your password');
    const loginButton = page.getByRole('button', { name: 'Login' });

    await emailInput.fill('customer@practicesoftwaretesting.com');
    await passwordInput.fill('welcome01');
    await loginButton.click();
    await page.waitForTimeout(3000);

    await expect(page, 'Expected to be redirected to account page').toHaveURL(/\/account/, { timeout: 10000 });
  });
});