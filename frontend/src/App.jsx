import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { ThemeProvider } from './lib/theme';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages — public
import Catalog       from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import Login         from './pages/Login';
import Register      from './pages/Register';

// Pages — customer
import Pedidos       from './pages/conta/Pedidos';

// Pages — admin
import Dashboard     from './pages/admin/Dashboard';
import AdminProdutos from './pages/admin/Produtos';
import ProdutoForm   from './pages/admin/ProdutoForm';
import Materiais     from './pages/admin/Materiais';
import MaterialForm  from './pages/admin/MaterialForm';
import Categorias    from './pages/admin/Categorias';
import AdminPedidos  from './pages/admin/Pedidos';
import Configuracoes from './pages/admin/Configuracoes';
import Vitrine       from './pages/admin/Vitrine';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/"              element={<Catalog />} />
            <Route path="/produto/:slug" element={<ProductDetail />} />
            <Route path="/carrinho"      element={<Cart />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/cadastro"      element={<Register />} />

            {/* Customer */}
            <Route path="/conta/pedidos" element={
              <ProtectedRoute><Pedidos /></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin/dashboard"    element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/produtos"     element={<AdminRoute><AdminProdutos /></AdminRoute>} />
            <Route path="/admin/produtos/novo" element={<AdminRoute><ProdutoForm /></AdminRoute>} />
            <Route path="/admin/produtos/:id" element={<AdminRoute><ProdutoForm /></AdminRoute>} />
            <Route path="/admin/materiais"    element={<AdminRoute><Materiais /></AdminRoute>} />
            <Route path="/admin/materiais/novo" element={<AdminRoute><MaterialForm /></AdminRoute>} />
            <Route path="/admin/materiais/:id" element={<AdminRoute><MaterialForm /></AdminRoute>} />
            <Route path="/admin/categorias"   element={<AdminRoute><Categorias /></AdminRoute>} />
            <Route path="/admin/pedidos"      element={<AdminRoute><AdminPedidos /></AdminRoute>} />
            <Route path="/admin/configuracoes" element={<AdminRoute><Configuracoes /></AdminRoute>} />
            <Route path="/admin/vitrine"      element={<AdminRoute><Vitrine /></AdminRoute>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
