import { useState, useEffect } from 'react';
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

function SaveIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#0a0a0a] px-3 py-2.5 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 dark:focus:ring-[#39ff14]/50 outline-none text-sm transition-shadow';

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '' });
  const [editing, setEditing] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get('/admin/categorias').then(r => setCategorias(r.data)); }, []);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(null), 3000); }

  // Auto-generate slug from name
  function handleNameChange(val) {
    setForm(f => ({
      ...f,
      name: val,
      slug: val.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    }));
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/categorias', form);
      setCategorias(prev => [...prev, data]);
      setForm({ name: '', slug: '' });
      showToast('Categoria criada!');
    } catch (err) { showToast(err.response?.data?.error || 'Erro'); }
  }

  async function handleUpdate(cat) {
    try {
      const { data } = await api.put(`/admin/categorias/${cat.id}`, editing);
      setCategorias(prev => prev.map(c => c.id === cat.id ? data : c));
      setEditing(null);
      showToast('Categoria atualizada!');
    } catch (err) { showToast(err.response?.data?.error || 'Erro'); }
  }

  async function handleDelete(cat) {
    if (!confirm(`Deletar "${cat.name}"? Produtos desta categoria perderão a categoria.`)) return;
    try {
      await api.delete(`/admin/categorias/${cat.id}`);
      setCategorias(prev => prev.filter(c => c.id !== cat.id));
      showToast('Categoria excluída!');
    } catch (err) { showToast(err.response?.data?.error || 'Erro'); }
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Categorias</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{categorias.length} categoria{categorias.length !== 1 ? 's' : ''} cadastrada{categorias.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Create form */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Nova Categoria</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Nome</label>
            <input
              value={form.name}
              onChange={e => handleNameChange(e.target.value)}
              required
              placeholder="Ex: Miniaturas"
              className={inputClass}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Slug (URL)</label>
            <input
              value={form.slug}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              required
              placeholder="ex: miniaturas"
              className={inputClass}
            />
          </div>
          <div className="sm:self-end">
            <button
              type="submit"
              className="w-full sm:w-auto bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-5 py-2.5 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm"
            >
              Criar
            </button>
          </div>
        </form>
      </div>

      {/* Listing */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#111] border-b border-gray-200 dark:border-[#2a2a2a]">
              <tr>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Nome</th>
                <th className="text-left px-5 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Slug</th>
                <th className="px-5 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {categorias.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center text-gray-400 dark:text-gray-500 text-sm">
                    Nenhuma categoria cadastrada ainda.
                  </td>
                </tr>
              )}
              {categorias.map(cat => (
                <tr key={cat.id} className="border-t border-gray-100 dark:border-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
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
                        <div className="flex gap-1.5 justify-end">
                          <button
                            onClick={() => handleUpdate(cat)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black text-xs font-semibold rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all"
                          >
                            <SaveIcon />
                            Salvar
                          </button>
                          <button
                            onClick={() => setEditing(null)}
                            className="px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-gray-100">{cat.name}</td>
                      <td className="px-5 py-3.5">
                        <code className="text-xs bg-gray-100 dark:bg-[#222] text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
                          {cat.slug}
                        </code>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setEditing({ id: cat.id, name: cat.name, slug: cat.slug })}
                            aria-label={`Editar ${cat.name}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-all"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            aria-label={`Excluir ${cat.name}`}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <TrashIcon />
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
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 dark:bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl shadow-lg z-50 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          {toast}
        </div>
      )}
    </AdminLayout>
  );
}
