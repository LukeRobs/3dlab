import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#0a0a0a] px-4 py-2.5 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 focus:ring-2 focus:ring-green-500 dark:focus:ring-[#39ff14]/50 focus:border-transparent outline-none transition-all text-sm';

function Section({ title, description, children }) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden mb-6">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-[#1f1f1f]">
        <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-base">{title}</h2>
        {description && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{description}</p>}
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function MegaphoneIcon() {
  return (
    <svg className="w-5 h-5 text-green-600 dark:text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  );
}

function PreviewBadge({ text }) {
  if (!text.trim()) return <span className="text-gray-400 text-xs italic">Vazio</span>;
  return (
    <span
      className="text-xs font-semibold text-white"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

export default function Configuracoes() {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => { api.get('/admin/configuracoes').then(r => setSettings(r.data)); }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const { data } = await api.put('/admin/configuracoes', settings);
      setSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  const storeFields = [
    { key: 'store_name',        label: 'Nome da Loja',       placeholder: 'Loja Geek 3D' },
    { key: 'store_description', label: 'Descrição',          placeholder: 'Impressão 3D de qualidade...' },
    { key: 'whatsapp_number',   label: 'WhatsApp',           placeholder: '5511999999999 (apenas dígitos)' },
  ];

  const techFields = [
    { key: 'electricity_kwh_price', label: 'Preço do kWh (R$)',               type: 'number', step: '0.01', placeholder: '0.75' },
    { key: 'printer_power_watts',   label: 'Potência da impressora (Watts)',   type: 'number', placeholder: '200' },
  ];

  const announceFields = [
    { key: 'announce_msg_1', label: 'Mensagem 1', placeholder: 'Frete grátis a partir de <strong>R$ 300,00</strong>' },
    { key: 'announce_msg_2', label: 'Mensagem 2', placeholder: '5% OFF na primeira compra — Cupom: <strong>3DMAX</strong>' },
    { key: 'announce_msg_3', label: 'Mensagem 3', placeholder: '10% de desconto pagando no <strong>PIX</strong>' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Configurações</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gerencie as configurações da loja</p>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-4 mb-5 text-sm border border-red-200 dark:border-red-800/50">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Store info */}
        <Section title="Informações da Loja" description="Dados básicos da sua loja">
          <div className="space-y-4 max-w-lg">
            {storeFields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input
                  type="text"
                  value={settings[f.key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Topbar announcements */}
        <Section
          title="Mensagens da Top Bar"
          description="As mensagens rotativas no topo do site. Use <strong>texto</strong> para negrito."
        >
          <div className="space-y-5 max-w-xl">
            {/* Preview */}
            <div className="bg-gray-900 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Pré-visualização</p>
              <div className="space-y-2">
                {announceFields.map((f, i) => (
                  <div key={f.key} className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-600 font-mono w-4">{i+1}</span>
                    <div className="flex-1 h-px bg-gray-800" />
                    <div className="bg-gray-800 rounded px-3 py-1.5 min-w-0">
                      <PreviewBadge text={settings[f.key] || ''} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {announceFields.map((f, i) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i+1}
                  </span>
                  {f.label}
                </label>
                <input
                  type="text"
                  value={settings[f.key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Você pode usar HTML básico: <code className="bg-gray-100 dark:bg-[#222] px-1 py-0.5 rounded text-[11px]">&lt;strong&gt;texto&lt;/strong&gt;</code>
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* Technical config */}
        <Section title="Cálculo de Custo" description="Parâmetros técnicos para calcular o custo de cada impressão">
          <div className="space-y-4 max-w-sm">
            {techFields.map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{f.label}</label>
                <input
                  type={f.type || 'text'}
                  step={f.step}
                  value={settings[f.key] || ''}
                  onChange={e => setSettings(s => ({ ...s, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </Section>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-6 py-2.5 rounded-xl font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </button>

          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 dark:text-[#39ff14] text-sm font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Salvo com sucesso!
            </div>
          )}
        </div>
      </form>
    </AdminLayout>
  );
}
