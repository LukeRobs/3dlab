import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/auth';
import { addToLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    api.get('/categorias').then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    const params = selectedCategory ? { category: selectedCategory } : {};
    api.get('/produtos', { params }).then(r => setProducts(r.data));
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Catálogo</h1>
        <CategoryFilter
          categories={categories}
          selected={selectedCategory}
          onChange={slug => slug ? setSearchParams({ category: slug }) : setSearchParams({})}
        />
        {products.length === 0 ? (
          <p className="text-gray-500">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </main>
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
