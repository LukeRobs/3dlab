// backend/tests/admin/dashboard.test.js
const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/db/client');
const { createUser, tokenFor, createProduct } = require('../helpers');

let adminToken;
beforeEach(async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  adminToken = tokenFor(admin);
});

describe('GET /api/admin/dashboard', () => {
  it('returns all required metric fields', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.checkout_intents).toBeDefined();
    expect(res.body.pending_orders).toBeDefined();
    expect(res.body.confirmed_orders).toBeDefined();
    expect(res.body.cancelled_orders).toBeDefined();
    expect(res.body.confirmed_sales_value).toBeDefined();
    expect(Array.isArray(res.body.top_viewed_products)).toBe(true);
  });

  it('top_viewed_products items include margin_percent', async () => {
    await createProduct({ slug: 'p1', price: 100 });
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    const products = res.body.top_viewed_products;
    expect(products.length).toBeGreaterThan(0);
    expect(products[0].margin_percent).toBeDefined();
  });

  it('counts confirmed orders correctly', async () => {
    const customer = await createUser({ email: 'cust@test.com' });
    await pool.query(
      `INSERT INTO orders (user_id, total_price, status) VALUES ($1, 100, 'confirmed')`,
      [customer.id]
    );
    await pool.query(
      `INSERT INTO orders (user_id, total_price, status) VALUES ($1, 50, 'pending')`,
      [customer.id]
    );
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(parseInt(res.body.confirmed_orders)).toBe(1);
    expect(parseFloat(res.body.confirmed_sales_value)).toBe(100);
    expect(parseInt(res.body.checkout_intents)).toBe(2);
  });
});
