// backend/src/db/seed-admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./client');
const migrate = require('./migrate');

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_me_123';
const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Admin';

async function seed() {
  await migrate();
  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING RETURNING email`,
    [ADMIN_NAME, ADMIN_EMAIL, hash]
  );
  if (rows[0]) {
    console.log(`Admin created: ${rows[0].email}`);
  } else {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
  }
  await pool.end();
}

seed().catch(err => { console.error(err); process.exit(1); });
