import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { getLocalCart, updateLocalCart, removeFromLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';

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
      // Backend clears cart_items for this user in the same transaction.
      // No client-side cart clearing needed — navigating away unmounts this page.
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Carrinho</h1>
        {items.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 mb-4">Seu carrinho está vazio.</p>
            <a href="/" className="text-indigo-600 hover:underline">Ver produtos</a>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-4">
              {items.map(item => (
                <CartItem
                  key={item.id || item.product_id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                />
              ))}
            </div>
            <div className="mt-6 bg-white rounded-lg shadow p-4 flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="text-2xl font-bold">R$ {total.toFixed(2)}</p>
              </div>
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Processando...' : user ? 'Finalizar Compra' : 'Entrar para Finalizar'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
