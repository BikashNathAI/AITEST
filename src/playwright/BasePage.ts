import { Page, Locator, expect } from '@playwright/test';
import { logger } from '../reporting/logger';

export class BasePage {
  constructor(protected page: Page) {}

  async goto(path = ''): Promise<void> {
    const url = `${process.env.BASE_URL ?? ''}${path}`;
    logger.info('[Page] Navigating', { url });
    await this.page.goto(url);
    await this.page.waitForLoadState('networkidle');
  }

  async click(locator: Locator, description: string): Promise<void> {
    logger.debug('[Page] Click', { description });
    await locator.waitFor({ state: 'visible' });
    await locator.click();
  }

  async fill(locator: Locator, value: string, description: string): Promise<void> {
    logger.debug('[Page] Fill', { description });
    await locator.waitFor({ state: 'visible' });
    await locator.clear();
    await locator.fill(value);
  }

  async assertText(locator: Locator, expected: string): Promise<void> {
    await expect(locator, `Expected text: "${expected}"`).toContainText(expected);
  }

  async assertUrl(contains: string): Promise<void> {
    await expect(this.page, `URL should contain: ${contains}`).toHaveURL(new RegExp(contains));
  }

  async screenshot(name: string): Promise<void> {
    const screenshotPath = `test-results/screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: screenshotPath, fullPage: true });
    logger.info('[Page] Screenshot saved', { path: screenshotPath });
  }

  async waitForIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}
