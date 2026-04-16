require('dotenv').config();
const express = require('express');
const cors = require('cors');
const migrate = require('./db/migrate');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth',  require('./routes/auth'));
app.use('/api',       require('./routes/produtos'));

app.use('/api/admin/categorias', require('./routes/admin/categorias'));
app.use('/api/admin/materiais',  require('./routes/admin/materiais'));
app.use('/api/admin/produtos',   require('./routes/admin/produtos'));
app.use('/api/admin/pedidos',    require('./routes/admin/pedidos'));

app.use('/api/carrinho', require('./routes/carrinho'));
app.use('/api/pedidos', require('./routes/pedidos'));

app.use(errorHandler);

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  migrate()
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch((err) => { console.error('Startup failed:', err); process.exit(1); });
}
