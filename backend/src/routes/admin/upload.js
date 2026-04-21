// backend/src/routes/admin/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, requireRole } = require('../../middleware/auth');

const router = express.Router();
router.use(verifyToken, requireRole('admin'));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${unique}${ext}`);
  },
});

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPEG, PNG, WebP ou GIF são permitidas'));
    }
  },
});

// POST /api/admin/upload
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/uploads/${req.file.filename}`;
  res.json({ url });
});

module.exports = router;
