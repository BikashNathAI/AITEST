import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../reporting/logger';

export class LoginPage extends BasePage {

  private get emailInput()    { return this.page.getByPlaceholder('Your email'); }
  private get passwordInput() { return this.page.getByPlaceholder('Your password'); }
  private get loginButton()   { return this.page.getByRole('button', { name: 'Login' }); }
  private get errorAlert()    { return this.page.locator('.alert, .alert-danger').first(); }

  constructor(page: Page) { super(page); }

  async navigate(): Promise<void> {
    logger.info('[LoginPage] Navigating to login page');
    await this.page.goto('https://practicesoftwaretesting.com/auth/login');
    // Increased to 30s for CI — GitHub Actions servers are slower than localhost
    await this.page.getByPlaceholder('Your email')
                   .waitFor({ state: 'visible', timeout: 30000 });
    logger.info('[LoginPage] Form loaded ✅');
  }

  async login(email: string, password: string): Promise<void> {
    logger.info('[LoginPage] Logging in', { email });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await Promise.race([
      // Works for both customer (/account) and admin (/admin/dashboard)
      this.page.waitForURL(url => !url.includes('login'), { timeout: 15000 }),
      this.page.waitForSelector('.alert', { timeout: 15000 }),
    ]).catch(() => logger.warn('[LoginPage] No redirect or alert detected'));
  }

  async getErrorText(): Promise<string> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return (await this.errorAlert.textContent()) ?? '';
    } catch { return ''; }
  }

  async isLoggedIn(): Promise<boolean> {
    const url = this.page.url();
    return !url.includes('login') && !url.includes('auth');
  }
}