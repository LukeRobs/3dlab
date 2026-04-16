// backend/tests/pedidos.test.js
const request = require('supertest');
const app = require('../src/index');
const { pool } = require('../src/db/client');
const { createUser, tokenFor, createProduct } = require('./helpers');

let customer, customerToken, product;
beforeEach(async () => {
  customer = await createUser({ email: 'cust@test.com' });
  customerToken = tokenFor(customer);
  product = await createProduct({ slug: 'prod-1', price: 29.90 });
  // add to cart
  await pool.query(
    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, 1)`,
    [customer.id, product.id]
  );
});

describe('POST /api/pedidos', () => {
  it('creates order from cart, clears cart, returns WhatsApp URL', async () => {
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(201);
    expect(res.body.whatsapp_url).toContain('wa.me');
    expect(res.body.order.status).toBe('pending');
    expect(res.body.order.total_price).toBe('29.90');

    // cart should be cleared
    const cart = await request(app)
      .get('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(cart.body).toHaveLength(0);
  });

  it('returns 400 if cart is empty', async () => {
    await pool.query(`DELETE FROM cart_items WHERE user_id = $1`, [customer.id]);
    const res = await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(400);
  });
});

describe('GET /api/pedidos', () => {
  it('returns customer order history with items', async () => {
    await request(app)
      .post('/api/pedidos')
      .set('Authorization', `Bearer ${customerToken}`);
    const res = await request(app)
      .get('/api/pedidos')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].items).toBeDefined();
    expect(res.body[0].items[0].product_name).toBeDefined();
  });
});
