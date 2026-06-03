// backend/tests/admin/configuracoes.test.js
const request = require('supertest');
const app = require('../../src/index');
const { pool } = require('../../src/db/client');
const { createUser, tokenFor, createProduct, createMaterial } = require('../helpers');

let adminToken;
beforeEach(async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  adminToken = tokenFor(admin);
});

describe('GET /api/admin/configuracoes', () => {
  it('returns all settings as key-value object', async () => {
    const res = await request(app)
      .get('/api/admin/configuracoes')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.whatsapp_number).toBeDefined();
    expect(res.body.electricity_kwh_price).toBeDefined();
  });
});

describe('PUT /api/admin/configuracoes', () => {
  it('updates settings', async () => {
    const res = await request(app)
      .put('/api/admin/configuracoes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ whatsapp_number: '5521988888888' });
    expect(res.status).toBe(200);
    expect(res.body.whatsapp_number).toBe('5521988888888');
  });

  it('triggers cost recalculation on electricity change', async () => {
    const product = await createProduct({ slug: 'p1' });
    const material = await createMaterial({ pricePerGram: 0 });
    await pool.query(
      `INSERT INTO product_materials (product_id, material_id, quantity_grams) VALUES ($1, $2, 0)`,
      [product.id, material.id]
    );
    // set print time
    await pool.query(`UPDATE products SET print_time_minutes = 60 WHERE id = $1`, [product.id]);

    await request(app)
      .put('/api/admin/configuracoes')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ electricity_kwh_price: '1.00', printer_power_watts: '200' });

    const { rows } = await pool.query(`SELECT cost_calculated FROM products WHERE id = $1`, [product.id]);
    // 1h * 0.2kw * 1.00 = 0.20
    expect(parseFloat(rows[0].cost_calculated)).toBeCloseTo(0.20);
  });
});
