// backend/src/routes/admin/configuracoes.js
const express = require('express');
const { pool } = require('../../db/client');
const { verifyToken, requireRole } = require('../../middleware/auth');
const { recalculateAllProducts } = require('../../lib/recalculate');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

const VALID_KEYS = ['whatsapp_number', 'electricity_kwh_price', 'printer_power_watts', 'store_name', 'store_description'];

router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(`SELECT key, value FROM settings`);
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) { next(err); }
});

router.put('/', async (req, res, next) => {
  try {
    const electricityKeys = ['electricity_kwh_price', 'printer_power_watts'];

    // Read current values once to detect actual changes before triggering recalculation.
    const { rows: current } = await pool.query(`SELECT key, value FROM settings`);
    const currentMap = Object.fromEntries(current.map(r => [r.key, r.value]));

    let needsRecalc = false;

    for (const [key, value] of Object.entries(req.body)) {
      if (!VALID_KEYS.includes(key)) continue;
      const newValue = String(value);
      await pool.query(
        `UPDATE settings SET value = $1, updated_at = NOW() WHERE key = $2`,
        [newValue, key]
      );
      // Only trigger recalculation if an electricity value actually changed.
      if (electricityKeys.includes(key) && newValue !== currentMap[key]) {
        needsRecalc = true;
      }
    }

    // MVP note: settings updates and bulk recalculation are not wrapped in a transaction.
    if (needsRecalc) await recalculateAllProducts();

    const { rows } = await pool.query(`SELECT key, value FROM settings`);
    res.json(Object.fromEntries(rows.map(r => [r.key, r.value])));
  } catch (err) { next(err); }
});

module.exports = router;
