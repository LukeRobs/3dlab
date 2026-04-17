import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

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
      <h1 className="text-2xl font-bold mb-6">Categorias</h1>

      {/* Create form */}
      <form onSubmit={handleCreate} className="bg-white rounded-lg shadow p-4 mb-6 flex gap-3 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} required
            className="w-full border rounded px-3 py-2" />
        </div>
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">Criar</button>
      </form>

      {/* Listing */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {categorias.map(cat => (
              <tr key={cat.id} className="border-b last:border-0">
                {editing?.id === cat.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input value={editing.name} onChange={e => setEditing(ed => ({ ...ed, name: e.target.value }))}
                        className="border rounded px-2 py-1 w-full" />
                    </td>
                    <td className="px-4 py-2">
                      <input value={editing.slug} onChange={e => setEditing(ed => ({ ...ed, slug: e.target.value }))}
                        className="border rounded px-2 py-1 w-full" />
                    </td>
                    <td className="px-4 py-2 flex gap-2 justify-end">
                      <button onClick={() => handleUpdate(cat)} className="text-green-600 hover:underline">Salvar</button>
                      <button onClick={() => setEditing(null)} className="text-gray-500 hover:underline">Cancelar</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-4 py-3">{cat.name}</td>
                    <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      <button onClick={() => setEditing({ id: cat.id, name: cat.name, slug: cat.slug })} className="text-indigo-600 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(cat)} className="text-red-500 hover:text-red-700">Excluir</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded">{toast}</div>}
    </AdminLayout>
  );
}
