import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { getLocalCart, clearLocalCart } from '../lib/cart';
import Navbar from '../components/Navbar';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);

      // Merge localStorage cart into DB after login
      const localCart = getLocalCart();
      if (localCart.length > 0) {
        await api.post('/carrinho/merge', {
          items: localCart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
        });
        clearLocalCart();
      }

      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Email ou senha incorretos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-md mx-auto px-4 py-16">
        <h1 className="text-2xl font-bold mb-6">Entrar</h1>
        {error && <p className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Senha</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded font-semibold hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Ainda não tem conta?{' '}
          <Link to={`/cadastro?redirect=${encodeURIComponent(redirect)}`} className="text-indigo-600 hover:underline">
            Cadastre-se
          </Link>
        </p>
      </main>
    </div>
  );
}
