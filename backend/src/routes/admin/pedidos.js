// backend/src/routes/admin/pedidos.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

async function recalcTotal(orderId) {
  await pool.query(
    `UPDATE orders SET total_price = (
       SELECT COALESCE(SUM(quantity * unit_price), 0) FROM order_items WHERE order_id = $1
     ) WHERE id = $1`,
    [orderId]
  );
}

async function fetchOrder(orderId) {
  const { rows } = await pool.query(
    `SELECT o.*, u.name as customer_name, u.email as customer_email
     FROM orders o JOIN users u ON u.id = o.user_id WHERE o.id = $1`,
    [orderId]
  );
  if (!rows[0]) return null;
  const { rows: items } = await pool.query(
    `SELECT oi.*, p.name as product_name FROM order_items oi
     JOIN products p ON p.id = oi.product_id WHERE oi.order_id = $1`,
    [orderId]
  );
  return { ...rows[0], items };
}

// ── List all orders ──
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

// ── Single order ──
router.get('/:id', async (req, res, next) => {
  try {
    const order = await fetchOrder(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { next(err); }
});

// ── Update status ──
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

// ── Delete order ──
router.delete('/:id', async (req, res, next) => {
  try {
    await pool.query(`DELETE FROM order_items WHERE order_id = $1`, [req.params.id]);
    const { rowCount } = await pool.query(`DELETE FROM orders WHERE id = $1`, [req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Order not found' });
    res.status(204).end();
  } catch (err) { next(err); }
});

// ── Add item to order ──
router.post('/:id/items', async (req, res, next) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id required' });

    // Get product price
    const { rows: prods } = await pool.query(`SELECT id, price FROM products WHERE id = $1`, [product_id]);
    if (!prods[0]) return res.status(404).json({ error: 'Product not found' });

    // If item already in order, increase quantity
    const { rows: existing } = await pool.query(
      `SELECT id, quantity FROM order_items WHERE order_id = $1 AND product_id = $2`,
      [req.params.id, product_id]
    );
    if (existing[0]) {
      await pool.query(
        `UPDATE order_items SET quantity = quantity + $1 WHERE id = $2`,
        [quantity, existing[0].id]
      );
    } else {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4)`,
        [req.params.id, product_id, quantity, prods[0].price]
      );
    }

    // Set status back to pending + recalc total
    await pool.query(`UPDATE orders SET status = 'pending' WHERE id = $1`, [req.params.id]);
    await recalcTotal(req.params.id);

    const order = await fetchOrder(req.params.id);
    res.json(order);
  } catch (err) { next(err); }
});

// ── Update item quantity ──
router.patch('/:id/items/:itemId', async (req, res, next) => {
  try {
    const { quantity } = req.body;
    if (!quantity || quantity < 1) return res.status(400).json({ error: 'quantity must be >= 1' });

    const { rowCount } = await pool.query(
      `UPDATE order_items SET quantity = $1 WHERE id = $2 AND order_id = $3`,
      [quantity, req.params.itemId, req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Item not found' });

    await pool.query(`UPDATE orders SET status = 'pending' WHERE id = $1`, [req.params.id]);
    await recalcTotal(req.params.id);

    const order = await fetchOrder(req.params.id);
    res.json(order);
  } catch (err) { next(err); }
});

// ── Remove item from order ──
router.delete('/:id/items/:itemId', async (req, res, next) => {
  try {
    const { rowCount } = await pool.query(
      `DELETE FROM order_items WHERE id = $1 AND order_id = $2`,
      [req.params.itemId, req.params.id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Item not found' });

    await pool.query(`UPDATE orders SET status = 'pending' WHERE id = $1`, [req.params.id]);
    await recalcTotal(req.params.id);

    const order = await fetchOrder(req.params.id);
    res.json(order);
  } catch (err) { next(err); }
});

module.exports = router;
