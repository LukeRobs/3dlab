import { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const SECTIONS = [
  {
    key: 'lancamentos',
    label: 'Lançamentos',
    description: 'Produtos novos em destaque na página inicial',
    badge: 'NOVO',
    badgeColor: 'bg-green-600',
    accent: 'border-green-500 dark:border-[#39ff14]',
    accentBg: 'bg-green-50 dark:bg-green-900/10',
    accentText: 'text-green-700 dark:text-[#39ff14]',
    pillBg: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  },
  {
    key: 'prevenda',
    label: 'Pré-venda',
    description: 'Produtos em pré-venda com disponibilidade futura',
    badge: 'EM BREVE',
    badgeColor: 'bg-amber-500',
    accent: 'border-amber-400 dark:border-amber-500',
    accentBg: 'bg-amber-50 dark:bg-amber-900/10',
    accentText: 'text-amber-700 dark:text-amber-400',
    pillBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  },
  {
    key: 'promocao',
    label: 'Promoção',
    description: 'Produtos com desconto ou em oferta especial',
    badge: '% OFF',
    badgeColor: 'bg-red-500',
    accent: 'border-red-400 dark:border-red-500',
    accentBg: 'bg-red-50 dark:bg-red-900/10',
    accentText: 'text-red-600 dark:text-red-400',
    pillBg: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  },
];

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function ProductRow({ product, section, onToggle, saving }) {
  const isInSection = product.section === section.key;
  return (
    <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
      isInSection
        ? `${section.accentBg} border-opacity-50 ${section.accent}`
        : 'bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
    }`}>
      {/* Thumbnail */}
      {product.primary_image ? (
        <img src={product.primary_image} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-[#2a2a2a]" />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#222] flex-shrink-0 flex items-center justify-center">
          <svg className="w-5 h-5 opacity-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isInSection ? section.accentText : 'text-gray-900 dark:text-gray-100'}`}>
          {product.name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          R$ {parseFloat(product.price).toFixed(2)}
          {product.section && product.section !== section.key && (
            <span className="ml-2 text-amber-500 dark:text-amber-400">
              (na seção: {SECTIONS.find(s => s.key === product.section)?.label})
            </span>
          )}
        </p>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => onToggle(product, section.key)}
        disabled={saving === product.id}
        aria-label={isInSection ? `Remover de ${section.label}` : `Adicionar a ${section.label}`}
        className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-50 ${
          isInSection
            ? `${section.accentBg} ${section.accentText} border ${section.accent} hover:bg-red-50 hover:text-red-500 hover:border-red-300 dark:hover:bg-red-900/20 dark:hover:text-red-400`
            : 'bg-gray-100 dark:bg-[#222] text-gray-400 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30 dark:hover:text-green-400 border border-transparent hover:border-green-300 dark:hover:border-green-700'
        }`}
      >
        {saving === product.id ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : isInSection ? (
          <XIcon />
        ) : (
          <CheckIcon />
        )}
      </button>
    </div>
  );
}

export default function Vitrine() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('lancamentos');
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    api.get('/admin/produtos')
      .then(r => setProdutos(r.data))
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  }

  const handleToggle = useCallback(async (product, sectionKey) => {
    const newSection = product.section === sectionKey ? null : sectionKey;
    setSaving(product.id);
    try {
      await api.patch(`/admin/produtos/${product.id}/section`, { section: newSection });
      setProdutos(prev => prev.map(p =>
        p.id === product.id ? { ...p, section: newSection } : p
      ));
      showToast(newSection
        ? `"${product.name}" adicionado à ${SECTIONS.find(s => s.key === sectionKey)?.label}!`
        : `"${product.name}" removido da seção.`
      );
    } catch (err) {
      showToast('Erro ao salvar. Tente novamente.');
    } finally {
      setSaving(null);
    }
  }, []);

  const currentSection = SECTIONS.find(s => s.key === activeSection);

  const filtered = produtos.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const inSection = filtered.filter(p => p.section === activeSection);
  const notInSection = filtered.filter(p => p.section !== activeSection);

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Vitrine</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Escolha quais produtos aparecem em cada seção da página inicial
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {SECTIONS.map(s => {
          const count = produtos.filter(p => p.section === s.key).length;
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveSection(s.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                isActive
                  ? `${s.accentBg} ${s.accentText} ${s.accent}`
                  : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300 dark:hover:border-[#3a3a3a]'
              }`}
            >
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded text-white ${s.badgeColor}`}>
                {s.badge}
              </span>
              {s.label}
              {count > 0 && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${isActive ? s.pillBg : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section info card */}
      {currentSection && (
        <div className={`rounded-xl border p-4 mb-5 ${currentSection.accentBg} ${currentSection.accent}`}>
          <p className={`text-sm font-medium ${currentSection.accentText}`}>
            {currentSection.description}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {inSection.length} produto{inSection.length !== 1 ? 's' : ''} nesta seção
            {inSection.length === 0 && ' — a seção mostrará placeholders "Em breve" no catálogo'}
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Filtrar produtos..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-[#2a2a2a] rounded-xl bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-green-500 dark:focus:ring-[#39ff14]/50 outline-none text-sm"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({length:6}).map((_,i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {/* In section */}
          {inSection.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                Na seção ({inSection.length})
              </p>
              <div className="space-y-2">
                {inSection.map(p => (
                  <ProductRow key={p.id} product={p} section={currentSection} onToggle={handleToggle} saving={saving} />
                ))}
              </div>
            </div>
          )}

          {/* Not in section */}
          <div>
            {inSection.length > 0 && (
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-2">
                Disponíveis para adicionar ({notInSection.length})
              </p>
            )}
            {notInSection.length === 0 && inSection.length === 0 && (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                <p className="text-sm">Nenhum produto encontrado</p>
              </div>
            )}
            <div className="space-y-2">
              {notInSection.map(p => (
                <ProductRow key={p.id} product={p} section={currentSection} onToggle={handleToggle} saving={saving} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 dark:bg-[#1a1a1a] text-white px-4 py-2.5 rounded-xl shadow-xl z-50 text-sm font-medium flex items-center gap-2">
          <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="max-w-xs">{toast}</span>
        </div>
      )}
    </AdminLayout>
  );
}
