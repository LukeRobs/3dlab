import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { getLocalCart, updateLocalCart, removeFromLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import Footer from '../components/Footer';

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadCart = useCallback(async () => {
    if (user) {
      const { data } = await api.get('/carrinho');
      setItems(data);
    } else {
      setItems(getLocalCart());
    }
  }, [user]);

  useEffect(() => { loadCart(); }, [loadCart]);

  async function handleQuantityChange(item, newQty) {
    if (newQty < 1) return handleRemove(item);
    if (user) {
      await api.put(`/carrinho/${item.id}`, { quantity: newQty });
      await loadCart();
    } else {
      setItems(updateLocalCart(item.product_id, newQty));
    }
  }

  async function handleRemove(item) {
    if (user) {
      await api.delete(`/carrinho/${item.id}`);
      await loadCart();
    } else {
      setItems(removeFromLocalCart(item.product_id));
    }
  }

  async function handleFinalize() {
    if (!user) {
      navigate(`/login?redirect=/carrinho`);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/pedidos');
      window.open(data.whatsapp_url, '_blank');
      navigate('/conta/pedidos');
    } catch (err) {
      alert(err.response?.data?.error || 'Erro ao finalizar pedido');
    } finally {
      setLoading(false);
    }
  }

  const total = items.reduce((sum, i) => sum + parseFloat(i.price || i.unit_price || 0) * i.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Carrinho</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-lg">Seu carrinho está vazio</p>
            <Link
              to="/"
              className="inline-block bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold px-8 py-3 rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <>
            <div>
              {items.map(item => (
                <CartItem
                  key={item.id || item.product_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 mt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-500 dark:text-gray-400 text-sm">Subtotal</span>
                <span className="text-xl font-bold text-gray-900 dark:text-gray-100">R$ {total.toFixed(2)}</span>
              </div>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="w-full bg-green-600 dark:bg-[#39ff14] text-white dark:text-black py-4 text-lg font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Processando...' : user ? 'Finalizar Compra' : 'Entrar para Finalizar'}
              </button>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
