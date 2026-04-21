import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { addToLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function CartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function PixBadge({ price }) {
  const pixPrice = (parseFloat(price) * 0.9).toFixed(2);
  return (
    <div className="flex items-center gap-2.5 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-xl px-4 py-3">
      <svg viewBox="0 0 100 100" className="w-7 h-7 flex-shrink-0" fill="none">
        <path d="M50 5L95 50L50 95L5 50Z" fill="#39ff14" fillOpacity="0.15" stroke="#39ff14" strokeWidth="3" />
        <path d="M50 25L75 50L50 75L25 50Z" fill="#39ff14" fillOpacity="0.4" />
        <path d="M50 40L60 50L50 60L40 50Z" fill="#39ff14" />
      </svg>
      <div>
        <p className="text-[#39ff14] text-xs font-semibold uppercase tracking-wide">10% OFF no PIX</p>
        <p className="text-[#39ff14] font-bold text-lg leading-none">
          R$ {pixPrice}
        </p>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">
        <div className="flex items-center gap-2 mb-8">
          <div className="h-4 w-12 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="rounded-xl aspect-square bg-gray-200 dark:bg-[#1a1a1a] animate-pulse" />
          <div className="space-y-4">
            <div className="h-5 w-20 bg-gray-200 dark:bg-[#1a1a1a] rounded-full animate-pulse" />
            <div className="h-10 w-3/4 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-8 w-1/3 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
            <div className="h-16 w-full bg-gray-200 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse w-5/6" />
            </div>
            <div className="h-14 w-full bg-gray-200 dark:bg-[#1a1a1a] rounded-xl animate-pulse mt-4" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [adding, setAdding] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({}); // { groupName: optionName }
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setProduct(null);
    setSelectedVariants({});
    api.get(`/produtos/${slug}`).then(r => {
      setProduct(r.data);
      setSelectedImage(null);
    });
    api.post(`/produtos/${slug}/view`).catch(() => {});
  }, [slug]);

  // All variant groups must have a selection before adding to cart
  const variantGroups = product?.variant_groups || [];
  const allVariantsSelected = variantGroups.every(g => selectedVariants[g.name]);

  function handleSelectVariant(groupName, optionName) {
    setSelectedVariants(prev => ({ ...prev, [groupName]: optionName }));
  }

  // Compute effective price including any price_modifier from selected options
  function getEffectivePrice() {
    if (!product) return 0;
    let price = parseFloat(product.price);
    for (const group of variantGroups) {
      const selectedOpt = group.options?.find(o => o.name === selectedVariants[group.name]);
      if (selectedOpt) price += parseFloat(selectedOpt.price_modifier || 0);
    }
    return price;
  }

  async function handleAddToCart() {
    if (variantGroups.length > 0 && !allVariantsSelected) return;
    setAdding(true);
    try {
      if (user) {
        await api.post('/carrinho', { product_id: product.id, quantity, selected_variants: selectedVariants });
      } else {
        addToLocalCart(product, quantity, selectedVariants);
      }
      setToast('Adicionado ao carrinho!');
      setTimeout(() => setToast(null), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setAdding(false);
    }
  }

  if (!product) return <ProductDetailSkeleton />;

  const primaryImage = selectedImage || product.images?.find(i => i.is_primary)?.url || product.images?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 py-10 w-full">

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-8 flex-wrap">
          <Link to="/" className="hover:text-green-600 dark:hover:text-[#39ff14] transition-colors">Home</Link>
          {product.category_name && product.category_slug && (
            <>
              <span className="opacity-40">/</span>
              <Link
                to={`/?category=${product.category_slug}`}
                className="hover:text-green-600 dark:hover:text-[#39ff14] transition-colors"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <span className="opacity-40">/</span>
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

          {/* Gallery */}
          <div>
            <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#111] aspect-square border border-gray-200 dark:border-[#2a2a2a]">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 opacity-15 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-2 mt-3">
                {product.images.map(img => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    aria-label="Selecionar imagem"
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                      (selectedImage === img.url || (!selectedImage && img.is_primary) || (!selectedImage && product.images[0] === img))
                        ? 'border-green-600 dark:border-[#39ff14] scale-105'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-[#2a2a2a] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Category */}
            {product.category_name && (
              <span className="inline-block bg-green-600/90 text-white text-xs px-3 py-1 rounded-full mb-3 font-semibold uppercase tracking-wide">
                {product.category_name}
              </span>
            )}

            {/* Name */}
            <h1 className="font-display text-4xl text-gray-900 dark:text-gray-100 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-4">
              <p className="text-3xl text-green-600 dark:text-[#39ff14] font-bold leading-none">
                R$ {getEffectivePrice().toFixed(2)}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                Em até 12x sem juros no cartão
              </p>
            </div>

            {/* PIX callout */}
            <div className="mb-5">
              <PixBadge price={getEffectivePrice()} />
            </div>

            {/* Variant selectors */}
            {variantGroups.length > 0 && (
              <div className="space-y-4 mb-5 border-t border-gray-100 dark:border-[#1a1a1a] pt-5">
                {variantGroups.map(group => (
                  <div key={group.id}>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                      {group.name}
                      {!selectedVariants[group.name] && (
                        <span className="ml-1.5 text-red-400 font-normal normal-case">— selecione uma opção</span>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {group.options?.filter(o => o.is_available).map(opt => {
                        const isSelected = selectedVariants[group.name] === opt.name;
                        const modifier = parseFloat(opt.price_modifier || 0);
                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectVariant(group.name, opt.name)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all active:scale-95 ${
                              isSelected
                                ? 'border-green-600 dark:border-[#39ff14] bg-green-600 dark:bg-[#39ff14] text-white dark:text-black shadow-md shadow-green-600/20 dark:shadow-[#39ff14]/15'
                                : 'border-gray-200 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:border-green-400 dark:hover:border-[#39ff14]/50 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                            }`}
                          >
                            {opt.name}
                            {modifier !== 0 && (
                              <span className={`ml-1.5 text-xs ${isSelected ? 'opacity-80' : 'text-green-600 dark:text-[#39ff14]'}`}>
                                {modifier > 0 ? `+R$${modifier.toFixed(2)}` : `-R$${Math.abs(modifier).toFixed(2)}`}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 border-t border-gray-100 dark:border-[#1a1a1a] pt-5">
                {product.description}
              </p>
            )}

            {/* Quantity selector */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantidade:</span>
              <div className="flex items-center border border-gray-200 dark:border-[#2a2a2a] rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  aria-label="Diminuir"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors font-bold text-lg border-r border-gray-200 dark:border-[#2a2a2a]"
                >
                  −
                </button>
                <span className="w-12 text-center font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(q => q + 1)}
                  aria-label="Aumentar"
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors font-bold text-lg border-l border-gray-200 dark:border-[#2a2a2a]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding || (variantGroups.length > 0 && !allVariantsSelected)}
              aria-label={`Adicionar ${quantity} unidade${quantity > 1 ? 's' : ''} de ${product.name} ao carrinho`}
              className="w-full bg-green-600 dark:bg-[#39ff14] text-white dark:text-black py-4 text-base font-semibold rounded-xl hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-green-600/20 dark:shadow-[#39ff14]/10"
            >
              {adding ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <CartIcon />
              )}
              {adding
                ? 'Adicionando...'
                : variantGroups.length > 0 && !allVariantsSelected
                ? 'Selecione as opções acima'
                : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      </main>

      <Footer />

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-5 py-3 rounded-xl shadow-xl z-30 text-sm font-semibold flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </div>
  );
}
