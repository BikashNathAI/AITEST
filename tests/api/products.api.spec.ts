import { test, expect } from '../../src/api/apiFixtures';

test.describe('Products API — GET /products', () => {

  test('TC-PRD-001 | GET /products → 200 + array of products', async ({ productsApi }) => {
    const data = await productsApi.getProducts();
    expect(data.data).toBeTruthy();
    expect(data.data.length).toBeGreaterThan(0);
    expect(data.total).toBeGreaterThan(0);
    console.log('✅ TC-PRD-001 — total products:', data.total);
  });

  test('TC-PRD-002 | each product has required fields', async ({ productsApi }) => {
    const data = await productsApi.getProducts();
    const product = data.data[0];
    expect(product.id).toBeTruthy();
    expect(product.name).toBeTruthy();
    expect(typeof product.price).toBe('number');
    console.log('✅ TC-PRD-002 — first product:', product.name, '— $' + product.price);
  });

  test('TC-PRD-003 | search products by name', async ({ productsApi }) => {
    const data = await productsApi.searchProducts('hammer');
    expect(data.data.length).toBeGreaterThan(0);
    console.log('✅ TC-PRD-003 — search results:', data.data.length);
  });

  test('TC-PRD-004 | pagination — page 2 is different from page 1', async ({ productsApi }) => {
    const page1 = await productsApi.getProducts(1);
    const page2 = await productsApi.getProducts(2);
    expect(page1.data[0].id).not.toBe(page2.data[0].id);
    console.log('✅ TC-PRD-004 — pagination works');
  });

});