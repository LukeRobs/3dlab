// backend/src/routes/produtos.js
const express = require('express');
const { pool } = require('../db/client');

const router = express.Router();

// GET /api/configuracoes (public — announce messages + store name)
router.get('/configuracoes', async (req, res, next) => {
  try {
    const PUBLIC_KEYS = ['store_name', 'announce_msg_1', 'announce_msg_2', 'announce_msg_3'];
    const { rows } = await pool.query(
      `SELECT key, value FROM settings WHERE key = ANY($1)`,
      [PUBLIC_KEYS]
    );
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) { next(err); }
});

// GET /api/categorias
router.get('/categorias', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT id, name, slug FROM categories ORDER BY name`);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/produtos
router.get('/produtos', async (req, res, next) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT p.id, p.name, p.slug, p.price, p.views_count, p.is_active, p.section,
             c.name as category_name, c.slug as category_slug,
             (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.is_active = true
    `;
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND c.slug = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }
    query += ` ORDER BY p.created_at DESC`;

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/produtos/:slug
router.get('/produtos/:slug', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.views_count,
              p.print_time_minutes,
              c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = $1 AND p.is_active = true`,
      [req.params.slug]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    const product = rows[0];

    const { rows: images } = await pool.query(
      `SELECT id, url, is_primary, sort_order FROM product_images
       WHERE product_id = $1 ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [product.id]
    );

    const { rows: materials } = await pool.query(
      `SELECT pm.material_id, m.name, m.type, pm.quantity_grams
       FROM product_materials pm
       JOIN materials m ON m.id = pm.material_id
       WHERE pm.product_id = $1`,
      [product.id]
    );

    // Variant groups + options
    const { rows: variantGroups } = await pool.query(
      `SELECT id, name, sort_order FROM product_variant_groups
       WHERE product_id = $1 ORDER BY sort_order ASC, created_at ASC`,
      [product.id]
    );
    for (const group of variantGroups) {
      const { rows: options } = await pool.query(
        `SELECT id, name, price_modifier, is_available, sort_order
         FROM product_variant_options WHERE group_id = $1
         ORDER BY sort_order ASC, created_at ASC`,
        [group.id]
      );
      group.options = options;
    }

    res.json({ ...product, images, product_materials: materials, variant_groups: variantGroups });
  } catch (err) { next(err); }
});

// POST /api/produtos/:slug/view
router.post('/produtos/:slug/view', async (req, res, next) => {
  try {
    await pool.query(
      `UPDATE products SET views_count = views_count + 1 WHERE slug = $1 AND is_active = true`,
      [req.params.slug]
    );
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
