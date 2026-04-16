// backend/src/routes/admin/categorias.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM categories ORDER BY name`);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    if (!name || !slug) return res.status(400).json({ error: 'name and slug required' });
    const { rows } = await pool.query(
      `INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING *`,
      [name, slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Slug already in use' });
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    const { rows } = await pool.query(
      `UPDATE categories SET name = COALESCE($1, name), slug = COALESCE($2, slug)
       WHERE id = $3 RETURNING *`,
      [name, slug, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Category not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { rows: products } = await pool.query(
      `SELECT id FROM products WHERE category_id = $1 LIMIT 1`,
      [req.params.id]
    );
    if (products.length > 0) {
      return res.status(409).json({ error: 'Category is used by products and cannot be deleted' });
    }
    await pool.query(`DELETE FROM categories WHERE id = $1`, [req.params.id]);
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
