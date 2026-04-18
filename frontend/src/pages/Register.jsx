import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { getLocalCart, clearLocalCart } from '../lib/cart';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form.name, form.email, form.password);

      const localCart = getLocalCart();
      if (localCart.length > 0) {
        await api.post('/carrinho/merge', {
          items: localCart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
        });
        clearLocalCart();
      }

      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { key: 'name', label: 'Nome', type: 'text' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'password', label: 'Senha', type: 'password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a] px-4">
      <div className="max-w-md w-full rounded-2xl shadow-xl bg-white dark:bg-[#1a1a1a] p-8">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-6">
          <span className="font-display text-3xl text-gray-900 dark:text-gray-100">LOJA GEEK 3D</span>
          <span className="text-2xl">🖨️</span>
        </div>

        <h1 className="font-display text-2xl text-gray-900 dark:text-gray-100 mb-6">Criar Conta</h1>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required
                className="w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none transition-shadow"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold py-3 rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Já tem conta?{' '}
          <Link
            to={`/login?redirect=${encodeURIComponent(redirect)}`}
            className="text-green-600 dark:text-[#39ff14] hover:underline font-medium"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
