import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://practicesoftwaretesting.com/auth/login');
    await page.getByPlaceholder('Your email').waitFor({ state: 'visible', timeout: 15000 });
  });

  test('Verify Login Button Visibility', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Login' }), 'Login button is not visible').toBeVisible();
  });

  test('Valid Login Test', async ({ page }) => {
    await page.getByPlaceholder('Your email').fill('customer@practicesoftwaretesting.com');
    await page.getByPlaceholder('Your password').fill('welcome01');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(3000);
    await expect(page, 'URL does not contain /account').toHaveURL(/\/account/, { timeout: 10000 });
  });

  test('Invalid Login Test', async ({ page }) => {
    await page.getByPlaceholder('Your email').fill('invalid@practicesoftwaretesting.com');
    await page.getByPlaceholder('Your password').fill('invalid');
    await page.getByRole('button', { name: 'Login' }).click();
    await page.waitForTimeout(3000);
    await expect(page, 'URL is not /auth/login').toHaveURL(/\/auth\/login/, { timeout: 10000 });
  });
});