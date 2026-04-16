// backend/src/routes/pedidos.js
const express = require('express');
const { pool } = require('../db/client');
const { verifyToken } = require('../middleware/auth');
const { generateMessage, generateUrl } = require('../lib/whatsapp');

const router = express.Router();
router.use(verifyToken);

router.post('/', async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Get cart items with product info
    const { rows: cartItems } = await client.query(
      `SELECT ci.product_id, ci.quantity, p.name as product_name, p.price
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1`,
      [req.user.id]
    );
    if (cartItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const totalPrice = cartItems.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0);

    // Create order
    const { rows: [order] } = await client.query(
      `INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING *`,
      [req.user.id, totalPrice.toFixed(2)]
    );

    // Create order items
    for (const item of cartItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)`,
        [order.id, item.product_id, item.quantity, item.price]
      );
    }

    // Clear cart
    await client.query(`DELETE FROM cart_items WHERE user_id = $1`, [req.user.id]);

    // Get WhatsApp settings
    const { rows: settings } = await client.query(`SELECT key, value FROM settings`);
    const settingsMap = Object.fromEntries(settings.map(s => [s.key, s.value]));

    const orderItemsForMsg = cartItems.map(i => ({
      quantity: i.quantity,
      product_name: i.product_name,
      unit_price: i.price
    }));
    const message = generateMessage(orderItemsForMsg, totalPrice, order.id);
    const whatsappUrl = generateUrl(settingsMap.whatsapp_number, message);

    // Save WhatsApp message to order
    await client.query(
      `UPDATE orders SET whatsapp_message = $1 WHERE id = $2`,
      [message, order.id]
    );

    await client.query('COMMIT');
    res.status(201).json({ order, whatsapp_url: whatsappUrl });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
});

router.get('/', async (req, res, next) => {
  try {
    const { rows: orders } = await pool.query(
      `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
      [req.user.id]
    );
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const { rows: items } = await pool.query(
        `SELECT oi.*, p.name as product_name FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1`,
        [order.id]
      );
      return { ...order, items };
    }));
    res.json(ordersWithItems);
  } catch (err) { next(err); }
});

module.exports = router;
