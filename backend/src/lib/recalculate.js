// backend/src/lib/recalculate.js
const { pool } = require('../db/client');
const { calculateCost } = require('./cost');

// Accept an optional db client so callers inside a transaction can pass their client.
// Settings are fetched once per bulk operation and passed in to avoid N queries.
async function getSettings(client = pool) {
  const { rows } = await client.query(`SELECT key, value FROM settings`);
  return Object.fromEntries(rows.map(r => [r.key, r.value]));
}

// settings is optional — if not provided, fetched from DB using the given client.
async function recalculateProduct(productId, client = pool, settings = null) {
  const resolvedSettings = settings || await getSettings(client);
  const { rows: product } = await client.query(
    `SELECT print_time_minutes FROM products WHERE id = $1`, [productId]
  );
  const { rows: materials } = await client.query(
    `SELECT pm.quantity_grams, m.price_per_gram
     FROM product_materials pm JOIN materials m ON m.id = pm.material_id
     WHERE pm.product_id = $1`,
    [productId]
  );
  const cost = calculateCost(product[0]?.print_time_minutes || 0, materials, resolvedSettings);
  await client.query(
    `UPDATE products SET cost_calculated = $1, updated_at = NOW() WHERE id = $2`,
    [cost, productId]
  );
  return cost;
}

// Fetch settings once and reuse across all product recalculations.
async function recalculateAllProducts(client = pool) {
  const settings = await getSettings(client);
  const { rows: products } = await client.query(`SELECT id FROM products`);
  // Sequential to avoid exhausting the connection pool on large catalogs.
  for (const p of products) {
    await recalculateProduct(p.id, client, settings);
  }
}

async function recalculateProductsUsingMaterial(materialId, client = pool) {
  const settings = await getSettings(client);
  const { rows } = await client.query(
    `SELECT DISTINCT product_id FROM product_materials WHERE material_id = $1`,
    [materialId]
  );
  for (const r of rows) {
    await recalculateProduct(r.product_id, client, settings);
  }
}

module.exports = { getSettings, recalculateProduct, recalculateAllProducts, recalculateProductsUsingMaterial };
