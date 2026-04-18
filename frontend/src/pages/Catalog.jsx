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

// Horizontal section with title, optional badge and up to 4 cards
function ProductSection({ title, badge, products, onAddToCart, filterSlug }) {
  if (products.length === 0) return null;
  return (
    <section className="mb-14">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100 leading-none">
            {title}
          </h2>
          {badge && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-600 dark:bg-[#39ff14] text-white dark:text-black">
              {badge}
            </span>
          )}
        </div>
        {filterSlug && (
          <Link
            to={`/?category=${filterSlug}`}
            className="text-sm text-green-600 dark:text-[#39ff14] hover:underline font-medium"
          >
            Ver todos →
          </Link>
        )}
      </div>
      <div className="h-px bg-gray-200 dark:bg-[#2a2a2a] mb-6" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.slice(0, 4).map(p => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
        ))}
      </div>
    </section>
  );
}

// Normalize a string to match category slugs/names without accents or special chars
function norm(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '');
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

  // Always load all products so sections can be derived client-side
  useEffect(() => {
    setIsLoading(true);
    api.get('/produtos').then(r => {
      setAllProducts(r.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, []);

  const handleAddToCart = useCallback(async (product) => {
    if (user) {
      try {
        await api.post('/carrinho', { product_id: product.id, quantity: 1 });
      } catch (err) {
        console.error(err);
      }
    } else {
      addToLocalCart(product);
    }
    setToast(`${product.name} adicionado ao carrinho!`);
    setTimeout(() => setToast(null), 2500);
  }, [user]);

  // Derive sections
  // Lançamentos: first 4 products (API returns newest first)
  const lancamentos = allProducts.slice(0, 4);

  // Pré-venda: products whose category name/slug matches "prevenda"
  const prevenda = allProducts.filter(p =>
    norm(p.category_name) === 'prevenda' || norm(p.category_slug) === 'prevenda'
  );
  const prevendaCategory = categories.find(c =>
    norm(c.name) === 'prevenda' || norm(c.slug) === 'prevenda'
  );

  // Promoção: products whose category name/slug matches "promocao"
  const promocao = allProducts.filter(p =>
    norm(p.category_name) === 'promocao' || norm(p.category_slug) === 'promocao'
  );
  const promocaoCategory = categories.find(c =>
    norm(c.name) === 'promocao' || norm(c.slug) === 'promocao'
  );

  // Filtered for the main catalog grid
  const filteredProducts = selectedCategory
    ? allProducts.filter(p =>
        p.category_slug === selectedCategory ||
        norm(p.category_name) === norm(selectedCategory)
      )
    : allProducts;

  const showSections = !selectedCategory && !isLoading;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] flex flex-col">
      <PixPopup />
      <Navbar />
      <HeroCarousel />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-10 w-full">

        {/* Named sections — hidden when a category filter is active */}
        {showSections && (
          <>
            <ProductSection
              title="Lançamentos"
              badge="NOVO"
              products={lancamentos}
              onAddToCart={handleAddToCart}
            />
            <ProductSection
              title="Pré-venda"
              badge="EM BREVE"
              products={prevenda}
              onAddToCart={handleAddToCart}
              filterSlug={prevendaCategory?.slug}
            />
            <ProductSection
              title="Promoção"
              badge="% OFF"
              products={promocao}
              onAddToCart={handleAddToCart}
              filterSlug={promocaoCategory?.slug}
            />
          </>
        )}

        {/* Main catalog */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100 leading-none">
              {selectedCategory ? 'Resultados' : 'Catálogo'}
            </h2>
            {!isLoading && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="h-px bg-gray-200 dark:bg-[#2a2a2a] mb-6" />

          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onChange={slug => slug ? setSearchParams({ category: slug }) : setSearchParams({})}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
              : filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
                ))
            }
          </div>

          {!isLoading && filteredProducts.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-16">Nenhum produto encontrado.</p>
          )}
        </section>
      </main>

      <Footer />

      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg shadow-lg z-30">
          {toast}
        </div>
      )}
    </div>
  );
}
