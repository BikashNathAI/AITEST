import { APIRequestContext, APIResponse } from '@playwright/test';
import { logger } from '../reporting/logger';

export class ApiClient {
  protected ctx:     APIRequestContext;
  protected baseUrl: string;
  protected token:   string | null = null;

  constructor(ctx: APIRequestContext) {
    this.ctx     = ctx;
    this.baseUrl = 'https://api.practicesoftwaretesting.com';
  }

  setToken(token: string): void {
    this.token = token;
    logger.info('[API] Token set');
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept':       'application/json',
    };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  async get(path: string): Promise<APIResponse> {
    const url = `${this.baseUrl}${path}`;
    logger.info('[API] GET', { url });
    const res = await this.ctx.get(url, { headers: this.headers() });
    logger.info('[API] Response', { status: res.status(), url });
    return res;
  }

  async post(path: string, body: Record<string, unknown>): Promise<APIResponse> {
    const url = `${this.baseUrl}${path}`;
    logger.info('[API] POST', { url });
    const res = await this.ctx.post(url, { headers: this.headers(), data: body });
    logger.info('[API] Response', { status: res.status(), url });
    return res;
  }

  async parseJson<T>(res: APIResponse): Promise<T> {
    const text = await res.text();
    try   { return JSON.parse(text) as T; }
    catch { throw new Error(`[API] Invalid JSON: ${text.slice(0, 200)}`); }
  }

  assertStatus(res: APIResponse, expected: number): void {
    if (res.status() !== expected)
      throw new Error(`[API] Expected ${expected}, got ${res.status()}`);
  }
}