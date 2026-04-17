import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function MaterialForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: 'filament', price_per_gram: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEdit) api.get('/admin/materiais').then(r => {
      const m = r.data.find(x => x.id === id);
      if (m) setForm({ name: m.name, type: m.type, price_per_gram: m.price_per_gram });
    });
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/admin/materiais/${id}`, form);
      } else {
        await api.post('/admin/materiais', form);
      }
      navigate('/admin/materiais');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Editar Material' : 'Novo Material'}</h1>
      {error && <p className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</p>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome</label>
          <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
            className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo</label>
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            className="w-full border rounded px-3 py-2">
            <option value="filament">Filamento</option>
            <option value="resin">Resina</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Preço por grama (R$)</label>
          <input type="number" step="0.000001" value={form.price_per_gram}
            onChange={e => setForm(f => ({ ...f, price_per_gram: e.target.value }))} required
            className="w-full border rounded px-3 py-2" />
        </div>
        <div className="flex gap-3">
          <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Salvar</button>
          <button type="button" onClick={() => navigate('/admin/materiais')} className="border px-6 py-2 rounded">Cancelar</button>
        </div>
      </form>
    </AdminLayout>
  );
}
