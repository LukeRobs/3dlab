// backend/tests/admin/pedidos.test.js
const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/db/client');
const { createUser, tokenFor, createProduct } = require('../helpers');

let adminToken, customer, product;
beforeEach(async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  adminToken = tokenFor(admin);
  customer = await createUser({ email: 'cust@test.com' });
  product = await createProduct({ slug: 'p1', price: 30 });
  // create an order manually
  const { rows: [order] } = await pool.query(
    `INSERT INTO orders (user_id, total_price) VALUES ($1, 30) RETURNING *`, [customer.id]
  );
  await pool.query(
    `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, 30)`,
    [order.id, product.id]
  );
});

describe('GET /api/admin/pedidos', () => {
  it('returns all orders with items', async () => {
    const res = await request(app)
      .get('/api/admin/pedidos')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].items).toBeDefined();
    expect(res.body[0].items[0].product_name).toBeDefined();
  });
});

describe('GET /api/admin/pedidos/:id', () => {
  it('returns single order with items and product names', async () => {
    const { rows: [order] } = await pool.query(`SELECT id FROM orders LIMIT 1`);
    const res = await request(app)
      .get(`/api/admin/pedidos/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(order.id);
    expect(Array.isArray(res.body.items)).toBe(true);
    expect(res.body.items[0].product_name).toBeDefined();
  });
});

describe('PUT /api/admin/pedidos/:id', () => {
  it('updates order status to confirmed', async () => {
    const { rows: [order] } = await pool.query(`SELECT id FROM orders LIMIT 1`);
    const res = await request(app)
      .put(`/api/admin/pedidos/${order.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'confirmed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });
});
