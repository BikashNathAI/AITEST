import { Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { logger } from '../reporting/logger';

export class LoginPage extends BasePage {

  // Selectors confirmed from codegen screenshot
  // placeholder="Your email" and placeholder="Your password"
  private get emailInput()    { return this.page.getByPlaceholder('Your email'); }
  private get passwordInput() { return this.page.getByPlaceholder('Your password'); }
  private get loginButton()   { return this.page.getByRole('button', { name: 'Login' }); }
  private get errorAlert()    { return this.page.locator('.alert, .alert-danger').first(); }

  constructor(page: Page) { super(page); }

  async navigate(): Promise<void> {
    logger.info('[LoginPage] Navigating to login page');
    // Direct URL — confirmed from your codegen screenshot
    await this.page.goto('https://practicesoftwaretesting.com/auth/login');
    // Wait for placeholder to confirm form is rendered
    await this.page.getByPlaceholder('Your email')
                   .waitFor({ state: 'visible', timeout: 15000 });
    logger.info('[LoginPage] Form loaded ✅');
  }

  async login(email: string, password: string): Promise<void> {
    logger.info('[LoginPage] Logging in', { email });
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await Promise.race([
      this.page.waitForURL(/account/, { timeout: 10000 }),
      this.page.waitForSelector('.alert', { timeout: 10000 }),
    ]).catch(() => logger.warn('[LoginPage] No redirect or alert detected'));
  }

  async getErrorText(): Promise<string> {
    try {
      await this.errorAlert.waitFor({ state: 'visible', timeout: 5000 });
      return (await this.errorAlert.textContent()) ?? '';
    } catch { return ''; }
  }
}