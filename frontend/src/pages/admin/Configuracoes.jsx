import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none';

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

  const storeFields = [
    { key: 'store_name',        label: 'Nome da Loja' },
    { key: 'store_description', label: 'Descrição' },
    { key: 'whatsapp_number',   label: 'WhatsApp (apenas dígitos, ex: 5511999999999)' },
  ];

  const techFields = [
    { key: 'electricity_kwh_price', label: 'Preço kWh (R$)',                     type: 'number', step: '0.01' },
    { key: 'printer_power_watts',   label: 'Potência da impressora (Watts)',      type: 'number' },
  ];

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Configurações</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg p-3 mb-4">
          Configurações salvas!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] max-w-lg p-6 space-y-4">
          {storeFields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
              <input
                type={f.type || 'text'}
                step={f.step}
                value={settings[f.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}

          <hr className="border-gray-200 dark:border-[#2a2a2a] my-4" />

          {techFields.map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{f.label}</label>
              <input
                type={f.type || 'text'}
                step={f.step}
                value={settings[f.key] || ''}
                onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                className={inputClass}
              />
            </div>
          ))}

          <button
            type="submit"
            className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all mt-2"
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
