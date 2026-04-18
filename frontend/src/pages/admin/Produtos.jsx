import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get('/admin/produtos').then(r => setProdutos(r.data)); }, []);

  async function handleDelete(produto) {
    if (!confirm(`Deletar "${produto.name}"?`)) return;
    try {
      const res = await api.delete(`/admin/produtos/${produto.id}`);
      if (res.status === 200) {
        setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, is_active: false } : p));
        setToast('Produto desativado (possui histórico de pedidos)');
      } else {
        setProdutos(prev => prev.filter(p => p.id !== produto.id));
        setToast('Produto excluído');
      }
    } catch (err) {
      setToast(err.response?.data?.error || 'Erro ao excluir');
    }
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = produtos.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Produtos</h1>
        <Link
          to="/admin/produtos/novo"
          className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
        >
          + Novo Produto
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar produto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none text-sm"
      />

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#2a2a2a]">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Preço</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Custo</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Views</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-gray-200 dark:border-[#2a2a2a] last:border-0 hover:bg-gray-50 dark:hover:bg-[#222]">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{p.name}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">R$ {parseFloat(p.price).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">R$ {parseFloat(p.cost_calculated).toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{p.views_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${p.is_active ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'}`}>
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      to={`/admin/produtos/${p.id}`}
                      title="Editar produto"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(p)}
                      title="Excluir produto"
                      className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-800 dark:bg-[#1a1a1a] text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
