import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth';
import { getLocalCart } from '../lib/cart';
import api from '../lib/api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dbCartCount, setDbCartCount] = useState(0);

  useEffect(() => {
    if (user) {
      api.get('/carrinho').then(r => {
        setDbCartCount(r.data.reduce((s, i) => s + i.quantity, 0));
      }).catch(() => {});
    }
  }, [user]);

  const cartCount = user
    ? dbCartCount
    : getLocalCart().reduce((s, i) => s + i.quantity, 0);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold">Loja Geek 3D</Link>
      <div className="flex items-center gap-4">
        <Link to="/carrinho" className="relative">
          Carrinho
          {cartCount > 0 && (
            <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1">{cartCount}</span>
          )}
        </Link>
        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin/dashboard">Admin</Link>}
            {user.role === 'customer' && <Link to="/conta/pedidos">Meus Pedidos</Link>}
            <button onClick={handleLogout} className="text-gray-400 hover:text-white">Sair</button>
          </>
        ) : (
          <Link to="/login">Entrar</Link>
        )}
      </div>
    </nav>
  );
}
