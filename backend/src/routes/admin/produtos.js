// backend/src/routes/admin/produtos.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { recalculateProduct } = require('../../lib/recalculate');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/produtos — slim list
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.cost_calculated, p.is_active, p.views_count, p.created_at,
              p.section,
              (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
       FROM products p ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// PATCH /api/admin/produtos/:id/section — update vitrine section
router.patch('/:id/section', async (req, res, next) => {
  try {
    const { section } = req.body; // null | 'lancamentos' | 'prevenda' | 'promocao'
    const validSections = [null, 'lancamentos', 'prevenda', 'promocao'];
    if (!validSections.includes(section)) {
      return res.status(400).json({ error: 'Invalid section' });
    }
    const { rows } = await pool.query(
      `UPDATE products SET section = $1 WHERE id = $2 RETURNING id, name, section`,
      [section, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// GET /api/admin/produtos/:id — full with images + materials
router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    const product = rows[0];

    const { rows: images } = await pool.query(
      `SELECT id, url, is_primary, sort_order FROM product_images
       WHERE product_id = $1 ORDER BY is_primary DESC, sort_order ASC, created_at ASC`,
      [product.id]
    );
    const { rows: materials } = await pool.query(
      `SELECT pm.material_id, m.name, m.type, m.price_per_gram, pm.quantity_grams
       FROM product_materials pm JOIN materials m ON m.id = pm.material_id
       WHERE pm.product_id = $1`,
      [product.id]
    );
    res.json({ ...product, images, product_materials: materials });
  } catch (err) { next(err); }
});

// POST /api/admin/produtos
router.post('/', async (req, res, next) => {
  try {
    const { name, slug, description, price, category_id, print_time_minutes } = req.body;
    if (!name || !slug || price === undefined) {
      return res.status(400).json({ error: 'name, slug, and price are required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO products (name, slug, description, price, category_id, print_time_minutes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, slug, description, price, category_id || null, print_time_minutes || 0]
    );
    const product = rows[0];
    await recalculateProduct(product.id);
    const { rows: updated } = await pool.query(`SELECT * FROM products WHERE id = $1`, [product.id]);
    res.status(201).json(updated[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already in use' });
    next(err);
  }
});

// PUT /api/admin/produtos/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { name, slug, description, price, category_id, print_time_minutes, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE products SET
         name = COALESCE($1, name), slug = COALESCE($2, slug),
         description = COALESCE($3, description), price = COALESCE($4, price),
         category_id = COALESCE($5, category_id),
         print_time_minutes = COALESCE($6, print_time_minutes),
         is_active = COALESCE($7, is_active),
         updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [name, slug, description, price, category_id, print_time_minutes, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
    await recalculateProduct(req.params.id);
    const { rows: updated } = await pool.query(`SELECT * FROM products WHERE id = $1`, [req.params.id]);
    res.json(updated[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/produtos/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rows: orderItems } = await pool.query(
      `SELECT id FROM order_items WHERE product_id = $1 LIMIT 1`, [req.params.id]
    );
    if (orderItems.length > 0) {
      // soft delete — product has order history
      const { rows } = await pool.query(
        `UPDATE products SET is_active = false, updated_at = NOW() WHERE id = $1 RETURNING *`,
        [req.params.id]
      );
      return res.json(rows[0]);
    }
    const { rowCount } = await pool.query(`DELETE FROM products WHERE id = $1`, [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Product not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

// POST /api/admin/produtos/:id/materiais
router.post('/:id/materiais', async (req, res, next) => {
  try {
    const { material_id, quantity_grams } = req.body;
    if (!material_id || quantity_grams === undefined) {
      return res.status(400).json({ error: 'material_id and quantity_grams required' });
    }
    const { rows } = await pool.query(
      `INSERT INTO product_materials (product_id, material_id, quantity_grams)
       VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, material_id, quantity_grams]
    );
    await recalculateProduct(req.params.id);
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/produtos/:id/materiais/:matId
router.put('/:id/materiais/:matId', async (req, res, next) => {
  try {
    const { quantity_grams } = req.body;
    const { rowCount } = await pool.query(
      `UPDATE product_materials SET quantity_grams = $1 WHERE product_id = $2 AND material_id = $3`,
      [quantity_grams, req.params.id, req.params.matId]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Material assignment not found' });
    await recalculateProduct(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

// DELETE /api/admin/produtos/:id/materiais/:matId
router.delete('/:id/materiais/:matId', async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM product_materials WHERE product_id = $1 AND material_id = $2`,
      [req.params.id, req.params.matId]
    );
    await recalculateProduct(req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
});

// POST /api/admin/produtos/:id/images
router.post('/:id/images', async (req, res, next) => {
  try {
    const { url, sort_order = 0 } = req.body;
    if (!url) return res.status(400).json({ error: 'url required' });
    const { rows } = await pool.query(
      `INSERT INTO product_images (product_id, url, sort_order) VALUES ($1, $2, $3) RETURNING *`,
      [req.params.id, url, sort_order]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/produtos/:id/images/:imgId
router.put('/:id/images/:imgId', async (req, res, next) => {
  try {
    const { is_primary, sort_order } = req.body;
    if (is_primary) {
      // unset any existing primary first
      await pool.query(
        `UPDATE product_images SET is_primary = false WHERE product_id = $1`,
        [req.params.id]
      );
    }
    const { rows } = await pool.query(
      `UPDATE product_images
       SET is_primary = COALESCE($1, is_primary), sort_order = COALESCE($2, sort_order)
       WHERE id = $3 AND product_id = $4 RETURNING *`,
      [is_primary, sort_order, req.params.imgId, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Image not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/produtos/:id/images/:imgId
router.delete('/:id/images/:imgId', async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM product_images WHERE id = $1 AND product_id = $2`,
      [req.params.imgId, req.params.id]
    );
    res.status(204).end();
  } catch (err) { next(err); }
});

// ──────────────────────────────────────────
// Variants
// ──────────────────────────────────────────

// GET /api/admin/produtos/:id/variants
router.get('/:id/variants', async (req, res, next) => {
  try {
    const { rows: groups } = await pool.query(
      `SELECT id, name, sort_order FROM product_variant_groups
       WHERE product_id = $1 ORDER BY sort_order ASC, created_at ASC`,
      [req.params.id]
    );
    for (const g of groups) {
      const { rows: opts } = await pool.query(
        `SELECT id, name, price_modifier, is_available, sort_order
         FROM product_variant_options WHERE group_id = $1 ORDER BY sort_order ASC, created_at ASC`,
        [g.id]
      );
      g.options = opts;
    }
    res.json(groups);
  } catch (err) { next(err); }
});

// POST /api/admin/produtos/:id/variants — create group
router.post('/:id/variants', async (req, res, next) => {
  try {
    const { name, sort_order = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const { rows } = await pool.query(
      `INSERT INTO product_variant_groups (product_id, name, sort_order) VALUES ($1,$2,$3) RETURNING *`,
      [req.params.id, name, sort_order]
    );
    res.status(201).json({ ...rows[0], options: [] });
  } catch (err) { next(err); }
});

// PUT /api/admin/produtos/:id/variants/:groupId — rename group
router.put('/:id/variants/:groupId', async (req, res, next) => {
  try {
    const { name } = req.body;
    const { rows } = await pool.query(
      `UPDATE product_variant_groups SET name=$1 WHERE id=$2 AND product_id=$3 RETURNING *`,
      [name, req.params.groupId, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Group not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/produtos/:id/variants/:groupId
router.delete('/:id/variants/:groupId', async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM product_variant_groups WHERE id=$1 AND product_id=$2`,
      [req.params.groupId, req.params.id]
    );
    res.status(204).end();
  } catch (err) { next(err); }
});

// POST /api/admin/produtos/:id/variants/:groupId/options
router.post('/:id/variants/:groupId/options', async (req, res, next) => {
  try {
    const { name, price_modifier = 0, sort_order = 0 } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const { rows } = await pool.query(
      `INSERT INTO product_variant_options (group_id, name, price_modifier, sort_order)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.params.groupId, name, price_modifier, sort_order]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/produtos/:id/variants/:groupId/options/:optId
router.put('/:id/variants/:groupId/options/:optId', async (req, res, next) => {
  try {
    const { name, price_modifier, is_available } = req.body;
    const { rows } = await pool.query(
      `UPDATE product_variant_options SET
         name = COALESCE($1, name),
         price_modifier = COALESCE($2, price_modifier),
         is_available = COALESCE($3, is_available)
       WHERE id=$4 AND group_id=$5 RETURNING *`,
      [name, price_modifier, is_available, req.params.optId, req.params.groupId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Option not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/produtos/:id/variants/:groupId/options/:optId
router.delete('/:id/variants/:groupId/options/:optId', async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM product_variant_options WHERE id=$1 AND group_id=$2`,
      [req.params.optId, req.params.groupId]
    );
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
