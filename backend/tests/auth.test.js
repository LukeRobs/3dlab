const request = require('supertest');
const app = require('../src/index');
const { createUser } = require('./helpers');

describe('POST /api/auth/register', () => {
  it('creates a customer and returns token + user with correct role in JWT payload', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'alice@test.com', password: 'password123'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('alice@test.com');
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.password_hash).toBeUndefined();

    // Verify the JWT payload itself carries the correct role claim
    const jwt = require('jsonwebtoken');
    const payload = jwt.decode(res.body.token);
    expect(payload.role).toBe('customer');
    expect(payload.id).toBeDefined();
  });

  it('returns 409 for duplicate email', async () => {
    await createUser({ email: 'alice@test.com' });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Alice', email: 'alice@test.com', password: 'password123'
    });
    expect(res.status).toBe(409);
  });

  it('returns 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'alice@test.com' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    await createUser({ email: 'alice@test.com' });
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@test.com', password: 'password123'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('returns 401 for wrong password', async () => {
    await createUser({ email: 'alice@test.com' });
    const res = await request(app).post('/api/auth/login').send({
      email: 'alice@test.com', password: 'wrong'
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'nobody@test.com', password: 'password123'
    });
    expect(res.status).toBe(401);
  });
});
