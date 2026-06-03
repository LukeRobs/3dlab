// backend/src/routes/admin/dashboard.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

router.get('/', async (req, res, next) => {
  try {
    const { rows: orderStats } = await pool.query(`
      SELECT
        COUNT(*)                                            AS checkout_intents,
        COUNT(*) FILTER (WHERE status = 'pending')         AS pending_orders,
        COUNT(*) FILTER (WHERE status = 'confirmed')       AS confirmed_orders,
        COUNT(*) FILTER (WHERE status = 'cancelled')       AS cancelled_orders,
        COALESCE(SUM(total_price) FILTER (WHERE status = 'confirmed'), 0) AS confirmed_sales_value
      FROM orders
    `);

    const { rows: topViewed } = await pool.query(`
      SELECT id, name, slug, views_count, price, cost_calculated,
             CASE WHEN price > 0
               THEN ROUND(((price - cost_calculated) / price * 100)::numeric, 2)
               ELSE 0 END AS margin_percent
      FROM products
      WHERE is_active = true
      ORDER BY views_count DESC
      LIMIT 10
    `);

    res.json({ ...orderStats[0], top_viewed_products: topViewed });
  } catch (err) { next(err); }
});

module.exports = router;
