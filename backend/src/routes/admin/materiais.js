// backend/src/routes/admin/materiais.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { recalculateProductsUsingMaterial } = require('../../lib/recalculate');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM materials ORDER BY name`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, type, price_per_gram } = req.body;
    if (!name || !type || price_per_gram === undefined) {
      return res.status(400).json({ error: 'name, type, and price_per_gram are required' });
    }
    if (typeof price_per_gram !== 'number' || !Number.isFinite(price_per_gram) || price_per_gram < 0) {
      return res.status(400).json({ error: 'price_per_gram must be a non-negative finite number' });
    }
    const { rows } = await pool.query(
      `INSERT INTO materials (name, type, price_per_gram) VALUES ($1, $2, $3) RETURNING *`,
      [name, type, price_per_gram]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, type, price_per_gram } = req.body;
    if (price_per_gram !== undefined &&
        (typeof price_per_gram !== 'number' || !Number.isFinite(price_per_gram) || price_per_gram < 0)) {
      return res.status(400).json({ error: 'price_per_gram must be a non-negative finite number' });
    }
    const { rows } = await pool.query(
      `UPDATE materials
       SET name = COALESCE($1, name), type = COALESCE($2, type),
           price_per_gram = COALESCE($3, price_per_gram)
       WHERE id = $4 RETURNING *`,
      [name, type, price_per_gram, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Material not found' });

    // Only trigger recalculation if price changed — other field updates don't affect cost
    if (price_per_gram !== undefined) {
      await recalculateProductsUsingMaterial(req.params.id);
    }

    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rows: used } = await pool.query(
      `SELECT product_id FROM product_materials WHERE material_id = $1 LIMIT 1`,
      [req.params.id]
    );
    if (used.length > 0) {
      return res.status(409).json({ error: 'Material is used by products and cannot be deleted' });
    }
    await pool.query(`DELETE FROM materials WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
