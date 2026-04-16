// backend/tests/admin/categorias.test.js
const request = require('supertest');
const app = require('../../src/index');
const { createUser, tokenFor, createCategory, createProduct } = require('../helpers');

let adminToken;
beforeEach(async () => {
  const admin = await createUser({ email: 'admin@test.com', role: 'admin' });
  adminToken = tokenFor(admin);
});

describe('GET /api/admin/categorias', () => {
  it('returns all categories for admin', async () => {
    await createCategory();
    const res = await request(app)
      .get('/api/admin/categorias')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/admin/categorias');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/admin/categorias', () => {
  it('creates a category', async () => {
    const res = await request(app)
      .post('/api/admin/categorias')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Figuras', slug: 'figuras' });
    expect(res.status).toBe(201);
    expect(res.body.slug).toBe('figuras');
  });
});

describe('PUT /api/admin/categorias/:id', () => {
  it('updates category name', async () => {
    const cat = await createCategory({ name: 'Old', slug: 'old-slug' });
    const res = await request(app)
      .put(`/api/admin/categorias/${cat.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'New Name' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New Name');
    expect(res.body.slug).toBe('old-slug');
  });

  it('returns 404 for non-existent category', async () => {
    const res = await request(app)
      .put('/api/admin/categorias/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/categorias/:id', () => {
  it('deletes unused category', async () => {
    const cat = await createCategory();
    const res = await request(app)
      .delete(`/api/admin/categorias/${cat.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });

  it('blocks delete when category has products', async () => {
    const cat = await createCategory();
    await createProduct({ categoryId: cat.id });
    const res = await request(app)
      .delete(`/api/admin/categorias/${cat.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(409);
  });
});
