import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none';

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-[#1a1a1a] border border-dashed border-gray-300 dark:border-[#2a2a2a] flex items-center justify-center mb-4">
        <svg className="w-7 h-7 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nenhum banner cadastrado</p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Adicione banners para aparecerem no carrossel da loja</p>
    </div>
  );
}

export default function Banners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [imageUrl, setImageUrl] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [buttonText, setButtonText] = useState('Ver Produto');
  const [buttonLink, setButtonLink] = useState('');
  const [formError, setFormError] = useState('');

  // Edit state
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const fileRef = useRef(null);

  async function load() {
    try {
      const { data } = await api.get('/admin/banners');
      setBanners(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    setImageUrl('');
    const reader = new FileReader();
    reader.onload = ev => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  }

  function clearForm() {
    setImageUrl(''); setUploadFile(null); setPreview(null);
    setTitle(''); setSubtitle(''); setButtonText('Ver Produto'); setButtonLink('');
    setFormError('');
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleAdd() {
    if (!uploadFile && !imageUrl.trim()) {
      setFormError('Selecione uma imagem ou cole uma URL.');
      return;
    }
    setFormError('');
    setSaving(true);
    try {
      let url = imageUrl.trim();
      if (uploadFile) {
        const fd = new FormData();
        fd.append('image', uploadFile);
        const { data } = await api.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        url = data.url;
      }
      const nextOrder = banners.length > 0 ? Math.max(...banners.map(b => b.sort_order)) + 1 : 0;
      await api.post('/admin/banners', {
        image_url: url,
        title: title.trim() || null,
        subtitle: subtitle.trim() || null,
        button_text: buttonText.trim() || 'Ver Produto',
        button_link: buttonLink.trim() || null,
        sort_order: nextOrder,
      });
      clearForm();
      await load();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(banner) {
    await api.put(`/admin/banners/${banner.id}`, { is_active: !banner.is_active });
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, is_active: !b.is_active } : b));
  }

  async function handleDelete(id) {
    if (!window.confirm('Remover este banner?')) return;
    await api.delete(`/admin/banners/${id}`);
    setBanners(prev => prev.filter(b => b.id !== id));
  }

  async function moveOrder(banner, dir) {
    const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order);
    const idx = sorted.findIndex(b => b.id === banner.id);
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const a = sorted[idx], b = sorted[swapIdx];
    const [oA, oB] = [a.sort_order, b.sort_order];
    await Promise.all([
      api.put(`/admin/banners/${a.id}`, { sort_order: oB }),
      api.put(`/admin/banners/${b.id}`, { sort_order: oA }),
    ]);
    await load();
  }

  function startEdit(banner) {
    setEditId(banner.id);
    setEditData({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      button_text: banner.button_text || 'Ver Produto',
      button_link: banner.button_link || '',
    });
  }

  async function saveEdit(id) {
    await api.put(`/admin/banners/${id}`, {
      title: editData.title.trim() || null,
      subtitle: editData.subtitle.trim() || null,
      button_text: editData.button_text.trim() || 'Ver Produto',
      button_link: editData.button_link.trim() || null,
    });
    setEditId(null);
    await load();
  }

  const sorted = [...banners].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <AdminLayout>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-7 bg-green-600 dark:bg-[#39ff14] rounded-full" />
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Banners do Carrossel</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* ── Add form ── */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 sticky top-6">
            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-4">Adicionar Banner</p>

            {/* Image picker */}
            <div className="mb-3">
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1.5">
                Imagem <span className="text-red-500">*</span>
              </label>

              {/* Preview */}
              {(preview || imageUrl) && (
                <div className="relative mb-2 rounded-xl overflow-hidden aspect-[16/7] bg-gray-100 dark:bg-[#111]">
                  <img
                    src={preview || imageUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => { setPreview(null); }}
                  />
                  <button
                    onClick={() => { setPreview(null); setUploadFile(null); setImageUrl(''); if (fileRef.current) fileRef.current.value = ''; }}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Upload zone */}
              {!preview && !imageUrl && (
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center aspect-[16/7] rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2a2a2a] hover:border-green-500 dark:hover:border-[#39ff14] cursor-pointer transition-colors group bg-gray-50 dark:bg-[#111] mb-2"
                >
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 group-hover:text-green-500 dark:group-hover:text-[#39ff14] transition-colors mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-green-600 dark:group-hover:text-[#39ff14] transition-colors font-medium">
                    Clique para fazer upload
                  </p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600 mt-0.5">JPG, PNG, WebP — máx. 8MB</p>
                  <p className="text-[10px] text-gray-300 dark:text-gray-600">Recomendado: 1920×640px</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />

              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
                <span className="text-[10px] text-gray-400 dark:text-gray-500">ou cole a URL</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
              </div>
              <input
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={e => { setImageUrl(e.target.value); setUploadFile(null); setPreview(null); }}
                className={inputClass}
              />
            </div>

            {/* Optional text fields */}
            <div className="space-y-2.5 mb-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  Título <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                </label>
                <input type="text" placeholder="Ex: Dragão Articulado" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">
                  Subtítulo <span className="text-gray-400 font-normal normal-case">(opcional)</span>
                </label>
                <input type="text" placeholder="Ex: Impressão 3D Premium" value={subtitle} onChange={e => setSubtitle(e.target.value)} className={inputClass} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Texto do botão</label>
                  <input type="text" placeholder="Ver Produto" value={buttonText} onChange={e => setButtonText(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide block mb-1">Link do botão</label>
                  <input type="text" placeholder="/produto/slug" value={buttonLink} onChange={e => setButtonLink(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {formError && (
              <p className="text-xs text-red-500 dark:text-red-400 mb-3">{formError}</p>
            )}

            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full bg-green-600 dark:bg-[#39ff14] text-white dark:text-black py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
              {saving ? 'Salvando…' : 'Adicionar Banner'}
            </button>
          </div>
        </div>

        {/* ── Banner list ── */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center justify-between">
              <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                Banners ativos
              </p>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {banners.filter(b => b.is_active).length} de {banners.length} visíveis
              </span>
            </div>

            {loading ? (
              <div className="p-5 space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="h-24 rounded-xl bg-gray-100 dark:bg-[#111] animate-pulse" />
                ))}
              </div>
            ) : sorted.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-[#1f1f1f]">
                {sorted.map((banner, idx) => (
                  <div key={banner.id} className={`p-4 transition-colors ${!banner.is_active ? 'opacity-50' : ''}`}>
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#2a2a2a]">
                        <img src={banner.image_url} alt="" className="w-full h-full object-cover" />
                      </div>

                      {/* Info / Edit */}
                      <div className="flex-1 min-w-0">
                        {editId === banner.id ? (
                          <div className="space-y-1.5">
                            <input
                              type="text" placeholder="Título"
                              value={editData.title}
                              onChange={e => setEditData(d => ({ ...d, title: e.target.value }))}
                              className="w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <input
                              type="text" placeholder="Subtítulo"
                              value={editData.subtitle}
                              onChange={e => setEditData(d => ({ ...d, subtitle: e.target.value }))}
                              className="w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-green-500"
                            />
                            <div className="flex gap-1.5">
                              <input
                                type="text" placeholder="Texto botão"
                                value={editData.button_text}
                                onChange={e => setEditData(d => ({ ...d, button_text: e.target.value }))}
                                className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-green-500"
                              />
                              <input
                                type="text" placeholder="/link"
                                value={editData.button_link}
                                onChange={e => setEditData(d => ({ ...d, button_link: e.target.value }))}
                                className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-1 focus:ring-green-500"
                              />
                            </div>
                            <div className="flex gap-1.5 pt-0.5">
                              <button onClick={() => saveEdit(banner.id)} className="px-3 py-1 rounded-lg bg-green-600 dark:bg-[#39ff14] text-white dark:text-black text-xs font-semibold hover:bg-green-700 transition-colors">
                                Salvar
                              </button>
                              <button onClick={() => setEditId(null)} className="px-3 py-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 text-xs hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {banner.title ? (
                              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{banner.title}</p>
                            ) : (
                              <p className="text-sm text-gray-400 dark:text-gray-500 italic">Sem título</p>
                            )}
                            {banner.subtitle && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{banner.subtitle}</p>
                            )}
                            {banner.button_link && (
                              <p className="text-xs text-green-600 dark:text-[#39ff14] truncate mt-0.5 font-mono">{banner.button_link}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {editId !== banner.id && (
                        <div className="flex flex-col gap-1 flex-shrink-0">
                          {/* Order arrows */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => moveOrder(banner, 'up')}
                              disabled={idx === 0}
                              className="w-7 h-7 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => moveOrder(banner, 'down')}
                              disabled={idx === sorted.length - 1}
                              className="w-7 h-7 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#222] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          </div>

                          {/* Toggle active */}
                          <button
                            onClick={() => toggleActive(banner)}
                            title={banner.is_active ? 'Desativar' : 'Ativar'}
                            className={`w-full h-7 rounded-lg border text-xs font-medium transition-all ${
                              banner.is_active
                                ? 'border-green-200 dark:border-[#39ff14]/30 bg-green-50 dark:bg-[#39ff14]/10 text-green-700 dark:text-[#39ff14]'
                                : 'border-gray-200 dark:border-[#2a2a2a] text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'
                            }`}
                          >
                            {banner.is_active ? 'Ativo' : 'Inativo'}
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => startEdit(banner)}
                            className="w-full h-7 rounded-lg border border-gray-200 dark:border-[#2a2a2a] text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
                          >
                            Editar
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="w-full h-7 rounded-lg border border-red-100 dark:border-red-900/30 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tip */}
          <div className="mt-3 flex items-start gap-2 px-1">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Banners sem título/botão mostram apenas a imagem. Se não houver nenhum banner ativo, o carrossel mostrará os produtos mais vistos automaticamente.
              Tamanho recomendado: <strong className="text-gray-500 dark:text-gray-400">1920×640px</strong> (proporção 3:1).
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
