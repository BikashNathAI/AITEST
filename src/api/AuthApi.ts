import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './ApiClient';
import { logger }    from '../reporting/logger';

export interface LoginResponse {
  access_token: string;
  token_type:   string;
}

export interface UserProfile {
  id:         number;
  first_name: string;
  last_name:  string;
  email:      string;
  role:       string;
}

export class AuthApi extends ApiClient {
  constructor(ctx: APIRequestContext) { super(ctx); }

  async login(email: string, password: string): Promise<LoginResponse> {
    logger.info('[AuthApi] Login via API', { email });
    const res  = await this.post('/users/login', { email, password });
    if (res.status() !== 200)
      throw new Error(`[AuthApi] Login failed: ${res.status()}`);
    const data = await this.parseJson<LoginResponse>(res);
    if (!data.access_token)
      throw new Error('[AuthApi] No token in response');
    this.setToken(data.access_token);
    return data;
  }

  async getProfile(): Promise<UserProfile> {
    const res = await this.get('/users/me');
    this.assertStatus(res, 200);
    return this.parseJson<UserProfile>(res);
  }

  async getToken(email: string, password: string): Promise<string> {
    const data = await this.login(email, password);
    return data.access_token;
  }
}