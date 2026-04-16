// backend/src/routes/admin/pedidos.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT o.*, u.name as customer_name, u.email as customer_email
       FROM orders o JOIN users u ON u.id = o.user_id
       ORDER BY o.created_at DESC`
    );
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const { rows: items } = await pool.query(
        `SELECT oi.*, p.name as product_name FROM order_items oi
         JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1`,
        [order.id]
      );
      return { ...order, items };
    }));
    res.json(ordersWithItems);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT o.*, u.name as customer_name FROM orders o
       JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    const { rows: items } = await pool.query(
      `SELECT oi.*, p.name as product_name FROM order_items oi
       JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1`,
      [req.params.id]
    );
    res.json({ ...rows[0], items });
  } catch (err) { next(err); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'status must be pending, confirmed, or cancelled' });
    }
    const { rows } = await pool.query(
      `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Order not found' });
    res.json(rows[0]);
  } catch (err) { next(err); }
});

module.exports = router;
