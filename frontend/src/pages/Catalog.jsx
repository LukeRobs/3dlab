import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { addToLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import HeroCarousel from '../components/HeroCarousel';
import Footer from '../components/Footer';
import SkeletonCard from '../components/SkeletonCard';
import PixPopup from '../components/PixPopup';

function norm(str) {
  return (str || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function SectionCarousel({ title, icon, badge, badgeBg, products, onAddToCart, filterSlug, alwaysShow }) {
  const [page, setPage] = useState(0);
  const PER = 4;
  const total = products.length;
  const hasProducts = total > 0;
  const maxPage = Math.max(0, total - PER);
  const canPrev = page > 0;
  const canNext = page < maxPage;
  const visible = hasProducts ? products.slice(page, page + PER) : [];

  if (!hasProducts && !alwaysShow) return null;

  return (
    <section className="mb-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-green-600 dark:bg-[#39ff14] rounded-full flex-shrink-0" />
          <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100 leading-none tracking-wide">
            {title}
          </h2>
          {icon && <span className="text-xl">{icon}</span>}
          {badge && (
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white ${badgeBg || 'bg-green-600 dark:bg-green-500'}`}>
              {badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filterSlug && hasProducts && (
            <Link
              to={`/?category=${filterSlug}`}
              className="text-sm text-green-600 dark:text-[#39ff14] hover:underline font-medium mr-2"
            >
              Ver todos →
            </Link>
          )}
          {total > PER && (
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={!canPrev}
                aria-label="Página anterior"
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${
                  canPrev
                    ? 'border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 dark:hover:bg-[#39ff14] dark:hover:text-black dark:hover:border-[#39ff14]'
                    : 'border-gray-200 dark:border-[#1a1a1a] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                ‹
              </button>
              <button
                onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                disabled={!canNext}
                aria-label="Próxima página"
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold transition-all ${
                  canNext
                    ? 'border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:text-white hover:border-green-600 dark:hover:bg-[#39ff14] dark:hover:text-black dark:hover:border-[#39ff14]'
                    : 'border-gray-200 dark:border-[#1a1a1a] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-[#1f1f1f] mb-6" />

      {/* Grid */}
      {hasProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {visible.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
          ))}
          {visible.length < PER && visible.length > 0 &&
            Array.from({ length: PER - visible.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))
          }
        </div>
      ) : (
        /* Empty state */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] border-dashed flex flex-col items-center justify-center py-12 px-4">
              <svg className="w-8 h-8 mb-3 opacity-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Em breve</p>
            </div>
          ))}
        </div>
      )}

      {/* Dot indicators */}
      {total > PER && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: maxPage + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              aria-label={`Ir para página ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === page
                  ? 'w-5 h-2 bg-green-600 dark:bg-[#39ff14]'
                  : 'w-2 h-2 bg-gray-300 dark:bg-[#2a2a2a] hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default function Catalog() {
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    api.get('/categorias').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    api.get('/produtos').then(r => {
      setAllProducts(r.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    if (user) {
      try { await api.post('/carrinho', { product_id: product.id, quantity: 1 }); }
      catch (err) { console.error(err); }
    } else {
      addToLocalCart(product);
    }
    setToast(`${product.name} adicionado!`);
    setTimeout(() => setToast(null), 2500);
  }, [user]);

  const lancamentos = allProducts.slice(0, Math.min(8, allProducts.length));
  const prevenda = allProducts.filter(p => norm(p.category_name) === 'prevenda' || norm(p.category_slug) === 'prevenda');
  const prevendaCategory = categories.find(c => norm(c.name) === 'prevenda' || norm(c.slug) === 'prevenda');
  const promocao = allProducts.filter(p => norm(p.category_name) === 'promocao' || norm(p.category_slug) === 'promocao');
  const promocaoCategory = categories.find(c => norm(c.name) === 'promocao' || norm(c.slug) === 'promocao');

  const filteredProducts = selectedCategory
    ? allProducts.filter(p => p.category_slug === selectedCategory || norm(p.category_name) === norm(selectedCategory))
    : allProducts;

  const showSections = !selectedCategory && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <PixPopup />
      <Navbar />
      <HeroCarousel />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full">

        {/* Named sections */}
        {showSections && (
          <>
            <SectionCarousel
              title="Lançamentos"
              badge="NOVO"
              badgeBg="bg-green-600 dark:bg-green-500"
              products={lancamentos}
              onAddToCart={handleAddToCart}
              alwaysShow={true}
            />
            <SectionCarousel
              title="Pré-venda"
              badge="EM BREVE"
              badgeBg="bg-amber-500"
              products={prevenda}
              onAddToCart={handleAddToCart}
              filterSlug={prevendaCategory?.slug}
              alwaysShow={true}
            />
            <SectionCarousel
              title="Promoção"
              badge="% OFF"
              badgeBg="bg-red-500"
              products={promocao}
              onAddToCart={handleAddToCart}
              filterSlug={promocaoCategory?.slug}
              alwaysShow={true}
            />
          </>
        )}

        {/* Full catalog */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-green-600 dark:bg-[#39ff14] rounded-full flex-shrink-0" />
              <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100 leading-none tracking-wide">
                {selectedCategory ? 'Resultados' : 'Todos os Produtos'}
              </h2>
              {!isLoading && (
                <span className="text-sm text-gray-400 dark:text-gray-500 font-normal">
                  ({filteredProducts.length})
                </span>
              )}
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSearchParams({})}
                className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-1.5 hover:border-gray-300"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Limpar filtro
              </button>
            )}
          </div>
          <div className="h-px bg-gray-200 dark:bg-[#1f1f1f] mb-6" />

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={slug => slug ? setSearchParams({ category: slug }) : setSearchParams({})}
          />

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))
            }
          </div>

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <svg className="w-14 h-14 mx-auto mb-4 opacity-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Nenhum produto encontrado.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Tente remover os filtros ou explorar outras categorias.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Toast notification */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2.5 rounded-xl shadow-xl z-30 text-sm font-semibold flex items-center gap-2"
        >
          <CheckIcon />
          {toast}
        </div>
      )}
    </div>
  );
}
