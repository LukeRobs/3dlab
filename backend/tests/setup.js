process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

// Validate TEST_DATABASE_URL is set before anything else tries to connect
if (!process.env.TEST_DATABASE_URL) {
  throw new Error(
    'TEST_DATABASE_URL is not set. Add it to your .env file or export it before running tests.\n' +
    'Example: TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/product_platform_test'
  );
}

const migrate = require('../src/db/migrate');
const { pool } = require('../src/db/client');

beforeAll(async () => {
  await migrate();
});

afterAll(async () => {
  await pool.end();
});

beforeEach(async () => {
  // CASCADE follows FK constraints, so dependent tables (product_images,
  // product_materials, order_items) are cleared automatically.
  await pool.query(`
    TRUNCATE users, categories, products, materials, settings, cart_items, orders
    CASCADE
  `);
  // Re-seed default settings after truncate
  await pool.query(`
    INSERT INTO settings (key, value) VALUES
      ('whatsapp_number',       '5511999999999'),
      ('electricity_kwh_price', '0.75'),
      ('printer_power_watts',   '200'),
      ('store_name',            'Test Store'),
      ('store_description',     '')
    ON CONFLICT (key) DO NOTHING
  `);
});
