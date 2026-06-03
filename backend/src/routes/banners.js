// backend/src/routes/banners.js — public
const express = require('express');
const { pool } = require('../db/client');

const router = express.Router();

// GET /api/banners — active banners ordered by sort_order
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM hero_banners WHERE is_active = true ORDER BY sort_order ASC, created_at ASC`
    );
    res.json(rows);
  } catch (err) { next(err); }
});

module.exports = router;
