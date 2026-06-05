import { test, expect } from '@playwright/test';

test.describe('Product Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://practicesoftwaretesting.com/auth/login');
    await page.waitForSelector('input', { state: 'visible', timeout: 15000 });
  });

  test('should search for hammer and verify product page', async ({ page }) => {
    await page.fill('input[placeholder="Your email"]', 'customer@practicesoftwaretesting.com');
    await page.fill('input[placeholder="Your password"]', 'welcome01');
    await page.click('role=button[name="Login"]');
    await page.waitForTimeout(3000);
    await expect(page).toHaveURL(/\/account/, { timeout: 10000 });

    await page.goto('https://practicesoftwaretesting.com');
    await page.waitForSelector('input', { state: 'visible', timeout: 15000 });
    await page.fill('input[placeholder="Search products..."]', 'hammer');
    await page.click('role=button[name="Search"]');
    await page.waitForTimeout(3000);
    const searchResults = page.locator('div.search-result');
    await expect(searchResults, 'Search results should be visible').toBeVisible();
    const firstResult = searchResults.first();
    await firstResult.click();
    await page.waitForTimeout(3000);
    const title = await page.title();
    await expect(title, 'Product page title should be visible').toBeVisible();
  });
});