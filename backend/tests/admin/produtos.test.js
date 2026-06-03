// backend/tests/admin/produtos.test.js
const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/db/client');
const { createUser, tokenFor, createCategory, createProduct, createMaterial } = require('../helpers');

let adminToken;
beforeEach(async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  adminToken = tokenFor(admin);
});

describe('POST /api/admin/produtos', () => {
  it('creates a product and calculates cost', async () => {
    const cat = await createCategory();
    const res = await request(app)
      .post('/api/admin/produtos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Funko Pop', slug: 'funko-pop', price: 59.90, category_id: cat.id, print_time_minutes: 120 });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('funko-pop');
    expect(res.body.cost_calculated).toBeDefined();
  });
});

describe('POST /api/admin/produtos/:id/materiais', () => {
  it('assigns material and recalculates cost', async () => {
    const product = await createProduct({ slug: 'p1' });
    const material = await createMaterial({ pricePerGram: 0.05 });
    const res = await request(app)
      .post(`/api/admin/produtos/${product.id}/materiais`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ material_id: material.id, quantity_grams: 100 });
    expect(res.status).toBe(201);

    const { rows } = await pool.query(`SELECT cost_calculated FROM products WHERE id = $1`, [product.id]);
    expect(parseFloat(rows[0].cost_calculated)).toBeGreaterThan(0);
  });
});

describe('PUT /api/admin/produtos/:id/materiais/:matId', () => {
  it('updates quantity and recalculates cost', async () => {
    const product = await createProduct({ slug: 'p1' });
    const material = await createMaterial({ pricePerGram: 0.10 });
    await pool.query(
      `INSERT INTO product_materials (product_id, material_id, quantity_grams) VALUES ($1, $2, 50)`,
      [product.id, material.id]
    );
    await request(app)
      .put(`/api/admin/produtos/${product.id}/materiais/${material.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ quantity_grams: 200 });

    const { rows } = await pool.query(`SELECT cost_calculated FROM products WHERE id = $1`, [product.id]);
    // 200g * 0.10 = 20.00
    expect(parseFloat(rows[0].cost_calculated)).toBeCloseTo(20.00);
  });
});

describe('DELETE /api/admin/produtos/:id/materiais/:matId', () => {
  it('removes material assignment and recalculates cost to 0', async () => {
    const product = await createProduct({ slug: 'p1' });
    const material = await createMaterial({ pricePerGram: 0.10 });
    await pool.query(
      `INSERT INTO product_materials (product_id, material_id, quantity_grams) VALUES ($1, $2, 100)`,
      [product.id, material.id]
    );
    await request(app)
      .delete(`/api/admin/produtos/${product.id}/materiais/${material.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const { rows } = await pool.query(`SELECT cost_calculated FROM products WHERE id = $1`, [product.id]);
    expect(parseFloat(rows[0].cost_calculated)).toBe(0);
  });
});

describe('DELETE /api/admin/produtos/:id', () => {
  it('hard-deletes a product with no order history', async () => {
    const product = await createProduct({ slug: 'p1' });
    const res = await request(app)
      .delete(`/api/admin/produtos/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('soft-deletes (deactivates) a product with order history', async () => {
    const product = await createProduct({ slug: 'p1' });
    const customer = await createUser({ email: 'cust@test.com', role: 'customer' });
    // create an order with this product
    const { rows: [order] } = await pool.query(
      `INSERT INTO orders (user_id, total_price) VALUES ($1, 50) RETURNING *`, [customer.id]
    );
    await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, 1, 50)`,
      [order.id, product.id]
    );

    const res = await request(app)
      .delete(`/api/admin/produtos/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.is_active).toBe(false);
  });
});

describe('GET /api/admin/produtos/:id', () => {
  it('returns full product with images and materials', async () => {
    const product = await createProduct({ slug: 'p1' });
    const res = await request(app)
      .get(`/api/admin/produtos/${product.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.images).toBeDefined();
    expect(res.body.product_materials).toBeDefined();
    expect(res.body.cost_calculated).toBeDefined();
  });
});
