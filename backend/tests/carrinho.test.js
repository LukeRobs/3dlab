// backend/tests/carrinho.test.js
const request = require('supertest');
const app = require('../src/index');
const { createUser, tokenFor, createProduct } = require('./helpers');

let customer, customerToken, product;
beforeEach(async () => {
  customer = await createUser({ email: 'cust@test.com' });
  customerToken = tokenFor(customer);
  product = await createProduct({ slug: 'prod-1' });
});

describe('POST /api/carrinho', () => {
  it('adds an item to the DB cart', async () => {
    const res = await request(app)
      .post('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ product_id: product.id, quantity: 2 });
    expect(res.status).toBe(201);
    expect(res.body.quantity).toBe(2);
  });

  it('increments quantity if product already in cart', async () => {
    await request(app)
      .post('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ product_id: product.id, quantity: 1 });
    await request(app)
      .post('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ product_id: product.id, quantity: 2 });
    const res = await request(app)
      .get('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.body[0].quantity).toBe(3);
  });
});

describe('GET /api/carrinho', () => {
  it('returns cart items with product info', async () => {
    await request(app)
      .post('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ product_id: product.id, quantity: 1 });
    const res = await request(app)
      .get('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body[0].product_name).toBeDefined();
    expect(res.body[0].price).toBeDefined();
  });
});

describe('POST /api/carrinho/merge', () => {
  it('merges localStorage items into DB cart', async () => {
    const product2 = await createProduct({ slug: 'prod-2' });
    // DB already has product at quantity 1
    await request(app)
      .post('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ product_id: product.id, quantity: 1 });

    // localStorage has same product (qty 2) + new product
    const res = await request(app)
      .post('/api/carrinho/merge')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ items: [
        { product_id: product.id,  quantity: 2 },
        { product_id: product2.id, quantity: 1 },
      ]});
    expect(res.status).toBe(200);

    const cart = await request(app)
      .get('/api/carrinho')
      .set('Authorization', `Bearer ${customerToken}`);
    const merged = cart.body.find(i => i.product_id === product.id);
    expect(merged.quantity).toBe(3); // 1 + 2
    expect(cart.body).toHaveLength(2);
  });
});
