import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function Configuracoes() {
  const [settings, setSettings] = useState({});
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { api.get('/admin/configuracoes').then(r => setSettings(r.data)); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.put('/admin/configuracoes', settings);
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    }
  }

  const fields = [
    { key: 'store_name',            label: 'Nome da Loja' },
    { key: 'store_description',     label: 'Descrição' },
    { key: 'whatsapp_number',       label: 'WhatsApp (apenas dígitos, ex: 5511999999999)' },
    { key: 'electricity_kwh_price', label: 'Preço kWh (R$)', type: 'number', step: '0.01' },
    { key: 'printer_power_watts',   label: 'Potência da impressora (Watts)', type: 'number' },
  ];

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>
      {error && <p className="text-red-600 mb-4 p-3 bg-red-50 rounded">{error}</p>}
      {saved && <p className="text-green-600 mb-4 p-3 bg-green-50 rounded">Configurações salvas!</p>}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 max-w-lg space-y-4">
        {fields.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium mb-1">{f.label}</label>
            <input
              type={f.type || 'text'} step={f.step}
              value={settings[f.key] || ''}
              onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        ))}
        <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">
          Salvar Configurações
        </button>
      </form>
    </AdminLayout>
  );
}
