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
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold text-white ${badgeBg || 'bg-green-600 dark:bg-green-500'}`}>
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {filterSlug && hasProducts && (
            <Link to={`/?category=${filterSlug}`} className="text-sm text-green-600 dark:text-[#39ff14] hover:underline font-medium mr-2">
              Ver mais →
            </Link>
          )}
          {total > PER && (
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={!canPrev}
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold transition-colors ${
                  canPrev
                    ? 'border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:dark:bg-[#39ff14] hover:text-white hover:dark:text-black hover:border-green-600'
                    : 'border-gray-200 dark:border-[#1a1a1a] text-gray-300 dark:text-gray-600 cursor-not-allowed'
                }`}
              >
                ‹
              </button>
              <button
                onClick={() => setPage(p => Math.min(maxPage, p + 1))}
                disabled={!canNext}
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-sm font-bold transition-colors ${
                  canNext
                    ? 'border-gray-300 dark:border-[#2a2a2a] text-gray-700 dark:text-gray-300 hover:bg-green-600 hover:dark:bg-[#39ff14] hover:text-white hover:dark:text-black hover:border-green-600'
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
      <div className="h-px bg-gray-200 dark:bg-[#2a2a2a] mb-6" />

      {/* Grid */}
      {hasProducts ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {visible.map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
          ))}
          {/* Fill empty slots if last page has fewer than PER */}
          {visible.length < PER && visible.length > 0 &&
            Array.from({ length: PER - visible.length }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))
          }
        </div>
      ) : (
        /* Empty state — always show section but with "Em breve" placeholders */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] border-dashed flex flex-col items-center justify-center py-12 px-4">
              <span className="text-3xl mb-3 opacity-40">🔒</span>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">Em breve</p>
            </div>
          ))}
        </div>
      )}

      {/* Dot indicators — shown when more than PER products */}
      {total > PER && (
        <div className="flex justify-center gap-1.5 mt-5">
          {Array.from({ length: maxPage + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === page
                  ? 'w-5 bg-green-600 dark:bg-[#39ff14]'
                  : 'bg-gray-300 dark:bg-[#2a2a2a]'
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
    setToast(`${product.name} adicionado ao carrinho!`);
    setTimeout(() => setToast(null), 2500);
  }, [user]);

  // Sections
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
              icon="🔥"
              badge="NOVO"
              badgeBg="bg-green-600"
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
                <span className="text-sm text-gray-500 dark:text-gray-400 font-normal">
                  ({filteredProducts.length})
                </span>
              )}
            </div>
            {selectedCategory && (
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                ✕ Limpar filtro
              </button>
            )}
          </div>
          <div className="h-px bg-gray-200 dark:bg-[#2a2a2a] mb-6" />

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={slug => slug ? setSearchParams({ category: slug }) : setSearchParams({})}
          />

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))
            }
          </div>

          {!isLoading && filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-gray-500 dark:text-gray-400 text-lg">Nenhum produto encontrado.</p>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2.5 rounded-lg shadow-lg z-30 text-sm font-medium">
          {toast}
        </div>
      )}
    </div>
  );
}
