// backend/tests/produtos.test.js
const request = require('supertest');
const app = require('../src/index');
const { createCategory, createProduct } = require('./helpers');

describe('GET /api/categorias', () => {
  it('returns all categories', async () => {
    await createCategory({ name: 'Figuras', slug: 'figuras' });
    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].slug).toBe('figuras');
  });
});

describe('GET /api/produtos', () => {
  it('returns only active products', async () => {
    const cat = await createCategory();
    await createProduct({ name: 'Active', slug: 'active', categoryId: cat.id });
    await createProduct({ name: 'Inactive', slug: 'inactive', isActive: false, categoryId: cat.id });
    const res = await request(app).get('/api/produtos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Active');
  });

  it('filters by category slug', async () => {
    const cat1 = await createCategory({ name: 'A', slug: 'cat-a' });
    const cat2 = await createCategory({ name: 'B', slug: 'cat-b' });
    await createProduct({ slug: 'p1', categoryId: cat1.id });
    await createProduct({ slug: 'p2', categoryId: cat2.id });
    const res = await request(app).get('/api/produtos?category=cat-a');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/produtos/:slug', () => {
  it('returns product with images and materials', async () => {
    const cat = await createCategory();
    const product = await createProduct({ categoryId: cat.id });
    const res = await request(app).get(`/api/produtos/${product.slug}`);
    expect(res.status).toBe(200);
    expect(res.body.images).toBeDefined();
    expect(res.body.product_materials).toBeDefined();
    expect(res.body.cost_calculated).toBeUndefined(); // cost not exposed publicly
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/produtos/nao-existe');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/produtos/:slug/view', () => {
  it('increments views_count', async () => {
    const cat = await createCategory();
    const product = await createProduct({ categoryId: cat.id });
    await request(app).post(`/api/produtos/${product.slug}/view`);
    const res = await request(app).get(`/api/produtos/${product.slug}`);
    expect(res.body.views_count).toBe(1);
  });
});
