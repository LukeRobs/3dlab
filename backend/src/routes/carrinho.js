// backend/src/routes/carrinho.js
const express = require('express');
const { pool } = require('../db/client');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();
router.use(verifyToken);

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT ci.id, ci.product_id, ci.quantity,
              p.name as product_name, p.price, p.slug,
              (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as image
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/merge', async (req, res, next) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'items must be an array' });

    for (const item of items) {
      await pool.query(
        `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
        [req.user.id, item.product_id, item.quantity]
      );
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });
    const { rows } = await pool.query(
      `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity
       RETURNING *`,
      [req.user.id, product_id, quantity]
    );
    res.status(201).json(rows[0]);
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });
    const { rows } = await pool.query(
      `UPDATE cart_items SET quantity = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
      [quantity, req.params.id, req.user.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Cart item not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query(
      `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.id]
    );
    res.status(204).end();
  } catch (err) { next(err); }
});

module.exports = router;
