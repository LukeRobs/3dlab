import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { addToLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/produtos/${slug}`).then(r => {
      setProduct(r.data);
      setSelectedImage(null);
    });
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

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <Navbar />
        <div className="max-w-5xl mx-auto px-4 py-10 text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    );
  }

  const primaryImage = selectedImage || product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8">
          <Link to="/" className="hover:text-green-600 dark:hover:text-[#39ff14] transition-colors">Home</Link>
          {product.category_name && product.category_slug && (
            <>
              <span>/</span>
              <Link
                to={`/?category=${product.category_slug}`}
                className="hover:text-green-600 dark:hover:text-[#39ff14] transition-colors"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Gallery */}
          <div>
            <div className="rounded-xl overflow-hidden bg-gray-100 dark:bg-[#111] aspect-square">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-6xl">🖨️</div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map(img => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt=""
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-16 h-16 object-cover rounded-lg cursor-pointer border-2 transition-colors ${
                      (selectedImage === img.url || (!selectedImage && img.is_primary) || (!selectedImage && product.images[0] === img))
                        ? 'border-green-600 dark:border-[#39ff14]'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-[#2a2a2a]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {product.category_name && (
              <span className="inline-block bg-green-600/90 text-white text-xs px-3 py-1 rounded-full mb-3">
                {product.category_name}
              </span>
            )}
            <h1 className="font-display text-4xl text-gray-900 dark:text-gray-100 leading-tight mb-3">
              {product.name}
            </h1>
            <p className="text-3xl text-green-600 dark:text-[#39ff14] font-bold mb-4">
              R$ {parseFloat(product.price).toFixed(2)}
            </p>
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
                {product.description}
              </p>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors"
                >
                  −
                </button>
                <span className="w-10 text-center font-medium text-gray-900 dark:text-gray-100">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-9 h-9 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full bg-green-600 dark:bg-[#39ff14] text-white dark:text-black py-4 text-lg font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
            >
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </main>
      <Footer />
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
