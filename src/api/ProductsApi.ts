import { APIRequestContext } from '@playwright/test';
import { ApiClient } from './ApiClient';

export interface Product {
  id:          string;
  name:        string;
  price:       number;
  in_stock:    boolean;
  category: { id: number; name: string; };
}

export interface ProductsResponse {
  current_page: number;
  data:         Product[];
  total:        number;
  per_page:     number;
  last_page:    number;
}

export class ProductsApi extends ApiClient {
  constructor(ctx: APIRequestContext) { super(ctx); }

  async getProducts(page = 1): Promise<ProductsResponse> {
    const res = await this.get(`/products?page=${page}`);
    this.assertStatus(res, 200);
    return this.parseJson<ProductsResponse>(res);
  }

  async getProduct(id: string): Promise<Product> {
    const res = await this.get(`/products/${id}`);
    this.assertStatus(res, 200);
    return this.parseJson<Product>(res);
  }

  async searchProducts(name: string): Promise<ProductsResponse> {
    const res = await this.get(`/products?by_name=${encodeURIComponent(name)}`);
    this.assertStatus(res, 200);
    return this.parseJson<ProductsResponse>(res);
  }
}