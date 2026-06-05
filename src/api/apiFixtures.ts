import { test as base, request } from '@playwright/test';
import { AuthApi }     from './AuthApi';
import { ProductsApi } from './ProductsApi';

type ApiFixtures = {
  authApi:     AuthApi;
  productsApi: ProductsApi;
  authToken:   string;
};

export const test = base.extend<ApiFixtures>({
  authApi: async ({}, use) => {
    const ctx = await request.newContext();
    await use(new AuthApi(ctx));
    await ctx.dispose();
  },

  productsApi: async ({}, use) => {
    const ctx = await request.newContext();
    await use(new ProductsApi(ctx));
    await ctx.dispose();
  },

  authToken: async ({}, use) => {
    const ctx   = await request.newContext();
    const api   = new AuthApi(ctx);
    const token = await api.getToken(
      'customer@practicesoftwaretesting.com',
      'welcome01',
    );
    await use(token);
    await ctx.dispose();
  },
});

export { expect } from '@playwright/test';