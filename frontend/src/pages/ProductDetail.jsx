import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { addToLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/produtos/${slug}`).then(r => setProduct(r.data));
    api.post(`/produtos/${slug}/view`).catch(() => {});
  }, [slug]);

  async function handleAddToCart() {
    if (user) {
      await api.post('/carrinho', { product_id: product.id, quantity });
    } else {
      addToLocalCart(product, quantity);
    }
    setToast('Adicionado ao carrinho!');
    setTimeout(() => setToast(null), 2500);
  }

  if (!product) return <div className="min-h-screen"><Navbar /><div className="p-8">Carregando...</div></div>;

  const primaryImage = product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:underline mb-4 block">&larr; Voltar</button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {primaryImage && <img src={primaryImage} alt={product.name} className="w-full rounded-lg" />}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-2">
                {product.images.map(img => (
                  <img key={img.id} src={img.url} alt="" className="w-16 h-16 object-cover rounded cursor-pointer border" />
                ))}
              </div>
            )}
          </div>
          <div>
            {product.category_name && <p className="text-sm text-gray-500 mb-1">{product.category_name}</p>}
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-2xl text-indigo-600 font-bold mb-4">R$ {parseFloat(product.price).toFixed(2)}</p>
            {product.description && <p className="text-gray-700 mb-6">{product.description}</p>}
            <div className="flex items-center gap-3 mb-4">
              <label className="text-sm font-medium">Quantidade:</label>
              <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-1 border rounded">-</button>
              <span className="w-8 text-center">{quantity}</span>
              <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-1 border rounded">+</button>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </main>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">{toast}</div>
      )}
    </div>
  );
}
