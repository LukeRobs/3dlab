// backend/src/routes/admin/banners.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/banners
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM hero_banners ORDER BY sort_order ASC, created_at ASC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/admin/banners
router.post('/', async (req, res, next) => {
  try {
    const { image_url, title, subtitle, button_text = 'Ver Produto', button_link, sort_order = 0 } = req.body;
    if (!image_url) return res.status(400).json({ error: 'image_url is required' });
    const { rows } = await pool.query(
      `INSERT INTO hero_banners (image_url, title, subtitle, button_text, button_link, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [image_url, title || null, subtitle || null, button_text, button_link || null, sort_order]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

// PUT /api/admin/banners/:id
router.put('/:id', async (req, res, next) => {
  try {
    const { image_url, title, subtitle, button_text, button_link, sort_order, is_active } = req.body;
    const { rows } = await pool.query(
      `UPDATE hero_banners SET
         image_url   = COALESCE($1, image_url),
         title       = $2,
         subtitle    = $3,
         button_text = COALESCE($4, button_text),
         button_link = $5,
         sort_order  = COALESCE($6, sort_order),
         is_active   = COALESCE($7, is_active)
       WHERE id = $8 RETURNING *`,
      [image_url, title ?? null, subtitle ?? null, button_text, button_link ?? null, sort_order, is_active, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Banner not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

// DELETE /api/admin/banners/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(`DELETE FROM hero_banners WHERE id = $1`, [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Banner not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
