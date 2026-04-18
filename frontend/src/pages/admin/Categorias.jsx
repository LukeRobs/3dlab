import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-3 py-2 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none text-sm';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get('/admin/categorias').then(r => setCategorias(r.data)); }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/categorias', form);
      setCategorias(prev => [...prev, data]);
      setForm({ name: '', slug: '' });
    } catch (err) { showToast(err.response?.data?.error || 'Erro'); }
  }

  async function handleUpdate(cat) {
    try {
      const { data } = await api.put(`/admin/categorias/${cat.id}`, editing);
      setCategorias(prev => prev.map(c => c.id === cat.id ? data : c));
      setEditing(null);
    } catch (err) { showToast(err.response?.data?.error || 'Erro'); }
  }

  async function handleDelete(cat) {
    if (!confirm(`Deletar "${cat.name}"?`)) return;
    try {
      await api.delete(`/admin/categorias/${cat.id}`);
      setCategorias(prev => prev.filter(c => c.id !== cat.id));
    } catch (err) { showToast(err.response?.data?.error || 'Erro'); }
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Categorias</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            required
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
        >
          Criar
        </button>
      </form>

      {/* Listing */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#2a2a2a]">
            <tr>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Nome</th>
              <th className="text-left px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr key={cat.id} className="border-b border-gray-200 dark:border-[#2a2a2a] last:border-0 hover:bg-gray-50 dark:hover:bg-[#222]">
                {editing?.id === cat.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editing.name}
                        onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editing.slug}
                        onChange={e => setEditing(ed => ({ ...ed, slug: e.target.value }))}
                        className={inputClass}
                      />
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleUpdate(cat)}
                          className="text-green-600 dark:text-[#39ff14] hover:underline text-sm font-medium"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="text-gray-500 dark:text-gray-400 hover:underline text-sm"
                        >
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{cat.slug}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setEditing({ id: cat.id, name: cat.name, slug: cat.slug })}
                          title="Editar categoria"
                          className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          title="Excluir categoria"
                          className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </>
                )}
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
