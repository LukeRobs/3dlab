import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { addToLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';
import HeroCarousel from '../components/HeroCarousel';
import Footer from '../components/Footer';
import SkeletonCard from '../components/SkeletonCard';

export default function Catalog() {
  const [products, setProducts] = useState([]);
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
    const params = selectedCategory ? { category: selectedCategory } : {};
    api.get('/produtos', { params }).then(r => {
      setProducts(r.data);
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
  }, [selectedCategory]);

  async function handleAddToCart(product) {
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
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />
      <HeroCarousel />
      <main className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Catálogo</h2>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={slug => slug ? setSearchParams({ category: slug }) : setSearchParams({})}
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {isLoading ? 'Carregando...' : `${products.length} produto${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}`}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : products.map(p => (
                <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
              ))
          }
        </div>
        {!isLoading && products.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-16">Nenhum produto encontrado.</p>
        )}
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
