import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get('/admin/materiais').then(r => setMateriais(r.data)); }, []);

  async function handleDelete(m) {
    if (!confirm(`Deletar "${m.name}"?`)) return;
    try {
      await api.delete(`/admin/materiais/${m.id}`);
      setMateriais(prev => prev.filter(x => x.id !== m.id));
      setToast('Material excluído');
    } catch (err) {
      setToast(err.response?.data?.error || 'Erro ao excluir');
    }
    setTimeout(() => setToast(null), 3000);
  }

  const filtered = materiais.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Matérias-primas</h1>
        <Link
          to="/admin/materiais/novo"
          className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
        >
          + Novo Material
        </Link>
      </div>

      <input
        type="text"
        placeholder="Buscar material..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4 w-full max-w-sm border border-gray-200 dark:border-[#2a2a2a] rounded-lg px-3 py-2 bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none text-sm"
      />

      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#2a2a2a]">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Tipo</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Preço/g (R$)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => (
              <tr key={m.id} className="border-b border-gray-200 dark:border-[#2a2a2a] last:border-0 hover:bg-gray-50 dark:hover:bg-[#222]">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{m.name}</td>
                <td className="px-4 py-3 capitalize text-gray-700 dark:text-gray-300">{m.type}</td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{parseFloat(m.price_per_gram).toFixed(4)}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <Link
                      to={`/admin/materiais/${m.id}`}
                      title="Editar material"
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                    >
                      ✏️
                    </Link>
                    <button
                      onClick={() => handleDelete(m)}
                      title="Excluir material"
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
