const { pool } = require('../src/db/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

async function createUser({ email = 'user@test.com', role = 'customer', name = 'Test User', password = 'password123' } = {}) {
  const hash = await bcrypt.hash(password, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, email, hash, role]
  );
  return rows[0];
}

function tokenFor(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

async function createCategory({ name = 'Test Cat', slug = 'test-cat' } = {}) {
  const { rows } = await pool.query(
    `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`,
    [name, slug]
  );
  return rows[0];
}

async function createProduct({ name = 'Product', slug = 'product', price = 29.90, categoryId = null, isActive = true, printTimeMinutes = 0 } = {}) {
  const { rows } = await pool.query(
    `INSERT INTO products (name, slug, description, price, category_id, is_active, print_time_minutes)
     VALUES ($1, $2, 'A product', $3, $4, $5, $6) RETURNING *`,
    [name, slug, price, categoryId, isActive, printTimeMinutes]
  );
  return rows[0];
}

async function createMaterial({ name = 'PLA', type = 'filament', pricePerGram = 0.05 } = {}) {
  const { rows } = await pool.query(
    `INSERT INTO materials (name, type, price_per_gram) VALUES ($1, $2, $3) RETURNING *`,
    [name, type, pricePerGram]
  );
  return rows[0];
}

module.exports = { createUser, tokenFor, createCategory, createProduct, createMaterial };
