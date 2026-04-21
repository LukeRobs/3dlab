import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { getLocalCart, updateLocalCart, removeFromLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import CartItem from '../components/CartItem';
import Footer from '../components/Footer';

function EmptyCartIcon() {
  return (
    <svg className="w-16 h-16 mx-auto mb-4 opacity-25 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
      navigate('/login?redirect=/carrinho');
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

  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price || i.unit_price || 0) * i.quantity, 0);
  const pixTotal = subtotal * 0.9;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 py-10 w-full">

        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Carrinho</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <EmptyCartIcon />
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-lg font-medium">Seu carrinho está vazio</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mb-6">Explore nosso catálogo e encontre algo incrível!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold px-8 py-3 rounded-xl hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
            >
              Ver Catálogo
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
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

            {/* Order summary */}
            <div className="bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 mt-4">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 text-base">Resumo do Pedido</h2>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 dark:text-gray-400 text-sm">
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} {items.reduce((s, i) => s + i.quantity, 0) === 1 ? 'item' : 'itens'})
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    R$ {subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* PIX discount highlight */}
              <div className="flex items-center justify-between bg-[#39ff14]/10 border border-[#39ff14]/25 rounded-xl px-4 py-3 mb-5">
                <div className="flex items-center gap-2">
                  <svg viewBox="0 0 100 100" className="w-5 h-5 flex-shrink-0" fill="none">
                    <path d="M50 5L95 50L50 95L5 50Z" fill="#39ff14" fillOpacity="0.3" stroke="#39ff14" strokeWidth="4" />
                    <path d="M50 30L70 50L50 70L30 50Z" fill="#39ff14" />
                  </svg>
                  <span className="text-[#39ff14] text-sm font-semibold">No PIX (10% OFF)</span>
                </div>
                <span className="text-[#39ff14] font-bold text-base">
                  R$ {pixTotal.toFixed(2)}
                </span>
              </div>

              {/* Finalize button */}
              <button
                onClick={handleFinalize}
                disabled={loading}
                className="w-full bg-green-600 dark:bg-[#39ff14] text-white dark:text-black py-4 text-base font-semibold rounded-xl hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-lg shadow-green-600/20 dark:shadow-[#39ff14]/10"
              >
                {loading ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                ) : (
                  <WhatsAppIcon />
                )}
                {loading ? 'Processando...' : user ? 'Finalizar pelo WhatsApp' : 'Entrar para Finalizar'}
              </button>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-3 leading-relaxed">
                Você será redirecionado para o WhatsApp para concluir o pedido.
              </p>
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
