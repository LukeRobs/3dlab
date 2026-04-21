import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

function EditIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}

const SECTION_LABELS = {
  lancamentos: { label: 'Lançamentos', bg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  prevenda:    { label: 'Pré-venda',   bg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  promocao:    { label: 'Promoção',    bg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [toastType, setToastType] = useState('success');

  useEffect(() => { api.get('/admin/produtos').then(r => setProdutos(r.data)); }, []);

  function showToast(msg, type = 'success') {
    setToast(msg);
    setToastType(type);
    setTimeout(() => setToast(null), 3000);
  }

  async function handleDelete(produto) {
    if (!confirm(`Deletar "${produto.name}"?`)) return;
    try {
      const res = await api.delete(`/admin/produtos/${produto.id}`);
      if (res.status === 200) {
        setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, is_active: false } : p));
        showToast('Produto desativado (possui pedidos)');
      } else {
        setProdutos(prev => prev.filter(p => p.id !== produto.id));
        showToast('Produto excluído');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao excluir', 'error');
    }
  }

  const filtered = produtos.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Produtos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{produtos.length} produto{produtos.length !== 1 ? 's' : ''} cadastrado{produtos.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to="/admin/produtos/novo"
          className="inline-flex items-center gap-2 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2.5 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm"
        >
          <PlusIcon />
          Novo Produto
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-5 max-w-sm">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Buscar produto..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-[#2a2a2a] rounded-lg bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-[#39ff14]/50 outline-none text-sm transition-shadow"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#2a2a2a]">
              <tr>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium w-12" />
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">Preço</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium hidden md:table-cell">Views</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium hidden lg:table-cell">Vitrine</th>
                <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium hidden sm:table-cell">Status</th>
                <th className="px-4 py-3 w-20" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500">
                    {search ? 'Nenhum produto encontrado.' : 'Nenhum produto cadastrado ainda.'}
                  </td>
                </tr>
              )}
              {filtered.map(p => (
                <tr key={p.id} className="border-t border-gray-100 dark:border-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
                  {/* Thumbnail */}
                  <td className="px-4 py-3">
                    {p.primary_image ? (
                      <img src={p.primary_image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-100 dark:border-[#2a2a2a]" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#222] flex items-center justify-center">
                        <svg className="w-5 h-5 opacity-30 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
                        </svg>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 max-w-[200px]">
                    <p className="truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-700 dark:text-gray-300 hidden sm:table-cell">
                    R$ {parseFloat(p.price).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell">{p.views_count}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {p.section ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${SECTION_LABELS[p.section]?.bg}`}>
                        {SECTION_LABELS[p.section]?.label}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.is_active
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-[#222] text-gray-500 dark:text-gray-500'
                    }`}>
                      {p.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 justify-end">
                      <Link
                        to={`/admin/produtos/${p.id}`}
                        aria-label={`Editar ${p.name}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all"
                      >
                        <EditIcon />
                      </Link>
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label={`Excluir ${p.name}`}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-4 py-2.5 rounded-xl shadow-lg z-50 text-sm font-semibold flex items-center gap-2 ${
          toastType === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-gray-900 dark:bg-[#1a1a1a] text-white'
        }`}>
          {toastType !== 'error' && (
            <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
