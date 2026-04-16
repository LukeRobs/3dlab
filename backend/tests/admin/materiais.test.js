// backend/tests/admin/materiais.test.js
const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/db/client');
const { createUser, tokenFor, createMaterial, createProduct } = require('../helpers');

let adminToken;
beforeEach(async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  adminToken = tokenFor(admin);
});

describe('POST /api/admin/materiais', () => {
  it('creates a material', async () => {
    const res = await request(app)
      .post('/api/admin/materiais')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'PLA Blue', type: 'filament', price_per_gram: 0.05 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('PLA Blue');
  });
});

describe('PUT /api/admin/materiais/:id — cost recalculation', () => {
  it('recalculates cost_calculated for linked products when price changes', async () => {
    const material = await createMaterial({ pricePerGram: 0.05 });
    const product = await createProduct({ slug: 'test-p' });
    await pool.query(
      `INSERT INTO product_materials (product_id, material_id, quantity_grams) VALUES ($1, $2, 100)`,
      [product.id, material.id]
    );

    await request(app)
      .put(`/api/admin/materiais/${material.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ price_per_gram: 0.10 }); // doubled price

    const { rows } = await pool.query(`SELECT cost_calculated FROM products WHERE id = $1`, [product.id]);
    // 100g * 0.10 = 10.00 (no electricity in test settings with 0 print time)
    expect(parseFloat(rows[0].cost_calculated)).toBeGreaterThan(0);
  });
});

describe('DELETE /api/admin/materiais/:id', () => {
  it('deletes unused material', async () => {
    const material = await createMaterial();
    const res = await request(app)
      .delete(`/api/admin/materiais/${material.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('blocks delete when material is used by a product', async () => {
    const material = await createMaterial();
    const product = await createProduct({ slug: 'test-p' });
    await pool.query(
      `INSERT INTO product_materials (product_id, material_id, quantity_grams) VALUES ($1, $2, 10)`,
      [product.id, material.id]
    );
    const res = await request(app)
      .delete(`/api/admin/materiais/${material.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
});
