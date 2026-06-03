import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none';

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
      <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">
        {isEdit ? 'Editar Material' : 'Novo Material'}
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 max-w-md space-y-4">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações do Material</p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              className={inputClass}
            >
              <option value="filament">Filamento</option>
              <option value="resin">Resina</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço por grama (R$)</label>
            <input
              type="number"
              step="0.000001"
              value={form.price_per_gram}
              onChange={e => setForm(f => ({ ...f, price_per_gram: e.target.value }))}
              required
              className={inputClass}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/materiais')}
              className="border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
