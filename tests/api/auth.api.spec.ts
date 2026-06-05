import { test, expect } from '../../src/api/apiFixtures';

test.describe('Auth API — POST /users/login', () => {

  test('TC-API-001 | valid login → 200 + JWT token', async ({ authApi }) => {
    const data = await authApi.login(
      'customer@practicesoftwaretesting.com', 'welcome01'
    );
    expect(data.access_token).toBeTruthy();
    expect(data.access_token.split('.').length).toBe(3); // JWT has 3 parts
    console.log('✅ TC-API-001 — token received');
  });

  test('TC-API-002 | wrong password → 401 or 422', async ({ authApi }) => {
    const res = await authApi.post('/users/login', {
      email: 'customer@practicesoftwaretesting.com',
      password: 'wrongpassword',
    });
    expect([401, 422, 400]).toContain(res.status());
    console.log('✅ TC-API-002 — rejected with:', res.status());
  });

  test('TC-API-003 | token → GET /users/me returns profile', async ({ authApi }) => {
    await authApi.login('customer@practicesoftwaretesting.com', 'welcome01');
    const profile = await authApi.getProfile();
    expect(profile.email).toBeTruthy();
    expect(profile.first_name).toBeTruthy();
    console.log('✅ TC-API-003 — profile:', profile.first_name, profile.email);
  });

  test('TC-API-004 | admin login → role contains admin', async ({ authApi }) => {
    await authApi.login('admin@practicesoftwaretesting.com', 'welcome01');
    const profile = await authApi.getProfile();
    expect(profile.role.toLowerCase()).toContain('admin');
    console.log('✅ TC-API-004 — admin role:', profile.role);
  });

});