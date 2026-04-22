import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none';

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="w-1 h-5 bg-green-600 dark:bg-[#39ff14] rounded-full" />
      <p className="font-semibold text-gray-900 dark:text-gray-100">{children}</p>
    </div>
  );
}

function NewHint({ children }) {
  return (
    <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/15 border border-amber-200 dark:border-amber-800/30 rounded-xl px-4 py-3 text-amber-700 dark:text-amber-400 text-sm">
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {children}
    </div>
  );
}

function OptionImageEditor({ defaultValue, onSave, onCancel }) {
  const [url, setUrl] = useState(defaultValue);
  return (
    <div className="flex gap-1.5 items-center mt-0.5">
      {url && (
        <img src={url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0 border border-gray-200 dark:border-[#2a2a2a]" onError={e => e.target.style.display='none'} />
      )}
      <input
        type="url"
        autoFocus
        value={url}
        onChange={e => setUrl(e.target.value)}
        placeholder="URL da foto desta variação"
        className="flex-1 rounded-lg border border-green-300 dark:border-[#39ff14]/40 bg-white dark:bg-[#111] px-2.5 py-1 text-xs text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
        onKeyDown={e => { if (e.key === 'Enter') onSave(url); if (e.key === 'Escape') onCancel(); }}
      />
      <button
        onClick={() => onSave(url)}
        className="text-xs bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-2 py-1 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        OK
      </button>
      <button onClick={onCancel} className="text-xs text-gray-400 hover:text-gray-600 px-1 py-1 transition-colors">
        ✕
      </button>
    </div>
  );
}

export default function ProdutoForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '',
    print_time_minutes: 0, category_id: '', is_active: true,
  });
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [productMaterials, setProductMaterials] = useState([]);
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [newMat, setNewMat] = useState({ material_id: '', quantity_grams: '' });
  const [error, setError] = useState(null);
  const [savingImage, setSavingImage] = useState(false);

  // Variants state
  const [variantGroups, setVariantGroups] = useState([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newOptions, setNewOptions] = useState({}); // { groupId: { name, price_modifier, image_url } }
  const [editingOptImage, setEditingOptImage] = useState(null); // optId being edited

  useEffect(() => {
    api.get('/categorias').then(r => setCategories(r.data));
    api.get('/admin/materiais').then(r => setMaterials(r.data));
    if (isEdit) {
      api.get(`/admin/produtos/${id}`).then(r => {
        const p = r.data;
        setForm({
          name: p.name, slug: p.slug, description: p.description || '',
          price: p.price, print_time_minutes: p.print_time_minutes,
          category_id: p.category_id || '', is_active: p.is_active,
        });
        setImages(p.images || []);
        setProductMaterials(p.product_materials || []);
      });
      api.get(`/admin/produtos/${id}/variants`).then(r => setVariantGroups(r.data));
    }
  }, [id, isEdit]);

  // Auto-generate slug from name (only when creating)
  function handleNameChange(e) {
    const name = e.target.value;
    setForm(f => ({
      ...f,
      name,
      slug: isEdit ? f.slug : name
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    }));
  }

  function handleField(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/admin/produtos/${id}`, form);
        // stay on page
      } else {
        const { data: newProduct } = await api.post('/admin/produtos', form);
        // Redirect to edit so images/materials can be added immediately
        navigate(`/admin/produtos/${newProduct.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    }
  }

  // ---------- Materials ----------
  async function handleAddMaterial() {
    if (!newMat.material_id || !newMat.quantity_grams || !id) return;
    await api.post(`/admin/produtos/${id}/materiais`, {
      material_id: newMat.material_id,
      quantity_grams: parseFloat(newMat.quantity_grams),
    });
    const r = await api.get(`/admin/produtos/${id}`);
    setProductMaterials(r.data.product_materials);
    setNewMat({ material_id: '', quantity_grams: '' });
  }

  async function handleUpdateMaterialQty(matId, newQty) {
    if (!newQty || parseFloat(newQty) <= 0 || !id) return;
    await api.put(`/admin/produtos/${id}/materiais/${matId}`, { quantity_grams: parseFloat(newQty) });
    setProductMaterials(prev => prev.map(m => m.material_id === matId ? { ...m, quantity_grams: newQty } : m));
  }

  async function handleRemoveMaterial(matId) {
    await api.delete(`/admin/produtos/${id}/materiais/${matId}`);
    setProductMaterials(prev => prev.filter(m => m.material_id !== matId));
  }

  // ---------- Images ----------
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
    setNewImageUrl('');
  }

  async function handleAddImage() {
    if (!id) return;
    setSavingImage(true);
    try {
      let url = newImageUrl.trim();
      if (uploadFile) {
        const formData = new FormData();
        formData.append('image', uploadFile);
        const { data } = await api.post('/admin/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        url = data.url;
      }
      if (!url) return;
      await api.post(`/admin/produtos/${id}/images`, { url });
      const r = await api.get(`/admin/produtos/${id}`);
      setImages(r.data.images);
      setNewImageUrl('');
      setUploadFile(null);
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
      setSavingImage(false);
    }
  }

  async function handleSetPrimary(imgId) {
    await api.put(`/admin/produtos/${id}/images/${imgId}`, { is_primary: true });
    setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imgId })));
  }

  async function handleRemoveImage(imgId) {
    await api.delete(`/admin/produtos/${id}/images/${imgId}`);
    setImages(prev => prev.filter(i => i.id !== imgId));
  }

  // ---------- Variants ----------
  async function handleAddGroup() {
    if (!newGroupName.trim() || !id) return;
    const { data } = await api.post(`/admin/produtos/${id}/variants`, { name: newGroupName.trim() });
    setVariantGroups(prev => [...prev, data]);
    setNewGroupName('');
  }

  async function handleDeleteGroup(groupId) {
    await api.delete(`/admin/produtos/${id}/variants/${groupId}`);
    setVariantGroups(prev => prev.filter(g => g.id !== groupId));
  }

  async function handleAddOption(groupId) {
    const opt = newOptions[groupId] || {};
    if (!opt.name?.trim()) return;
    const { data } = await api.post(`/admin/produtos/${id}/variants/${groupId}/options`, {
      name: opt.name.trim(),
      price_modifier: parseFloat(opt.price_modifier || 0),
      image_url: opt.image_url?.trim() || null,
    });
    setVariantGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, options: [...(g.options || []), data] } : g
    ));
    setNewOptions(prev => ({ ...prev, [groupId]: { name: '', price_modifier: '', image_url: '' } }));
  }

  async function handleSetOptionImage(groupId, opt, imageUrl) {
    const url = imageUrl.trim() || null;
    await api.put(`/admin/produtos/${id}/variants/${groupId}/options/${opt.id}`, { image_url: url });
    setVariantGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, options: g.options.map(o => o.id === opt.id ? { ...o, image_url: url } : o) }
        : g
    ));
    setEditingOptImage(null);
  }

  async function handleDeleteOption(groupId, optId) {
    await api.delete(`/admin/produtos/${id}/variants/${groupId}/options/${optId}`);
    setVariantGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, options: g.options.filter(o => o.id !== optId) } : g
    ));
  }

  async function handleToggleOption(groupId, opt) {
    await api.put(`/admin/produtos/${id}/variants/${groupId}/options/${opt.id}`, {
      is_available: !opt.is_available,
    });
    setVariantGroups(prev => prev.map(g =>
      g.id === groupId
        ? { ...g, options: g.options.map(o => o.id === opt.id ? { ...o, is_available: !o.is_available } : o) }
        : g
    ));
  }

  // Calculate cost from materials
  const totalCost = productMaterials.reduce((sum, pm) => {
    const mat = materials.find(m => m.id === pm.material_id);
    if (!mat) return sum;
    return sum + (parseFloat(mat.price_per_gram || 0) * parseFloat(pm.quantity_grams));
  }, 0);

  return (
    <AdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin/produtos')}
          className="p-2 rounded-lg border border-gray-200 dark:border-[#2a2a2a] text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
          aria-label="Voltar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl p-3 mb-4 text-sm flex items-center gap-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-6">

        {/* ── Basic Info ── */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 space-y-4">
            <SectionTitle>Informações do Produto</SectionTitle>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  name="name" type="text" required
                  value={form.name}
                  onChange={handleNameChange}
                  className={inputClass}
                  placeholder="Ex: Dragão Articulado"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug (URL) <span className="text-red-500">*</span>
                </label>
                <input
                  name="slug" type="text" required
                  value={form.slug}
                  onChange={handleField}
                  className={inputClass}
                  placeholder="dragao-articulado"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preço (R$) <span className="text-red-500">*</span>
                </label>
                <input
                  name="price" type="number" step="0.01" min="0" required
                  value={form.price}
                  onChange={handleField}
                  className={inputClass}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tempo de Impressão (min)
                </label>
                <input
                  name="print_time_minutes" type="number" min="0"
                  value={form.print_time_minutes}
                  onChange={handleField}
                  className={inputClass}
                  placeholder="Ex: 120"
                />
                {form.print_time_minutes > 0 && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    ≈ {Math.floor(form.print_time_minutes / 60)}h {form.print_time_minutes % 60}min
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
              <textarea
                name="description" value={form.description} onChange={handleField} rows={3}
                className={inputClass}
                placeholder="Descreva o produto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
              <select name="category_id" value={form.category_id} onChange={handleField} className={inputClass}>
                <option value="">Sem categoria</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {isEdit && (
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleField}
                  className="w-4 h-4 rounded accent-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Produto ativo (visível no catálogo)</span>
              </label>
            )}

            <div className="flex gap-3 pt-2 border-t border-gray-100 dark:border-[#2a2a2a]">
              <button
                type="submit"
                className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
              >
                {isEdit ? 'Salvar Alterações' : 'Criar e Continuar →'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/admin/produtos')}
                className="border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-6 py-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>

        {/* ── Materials ── */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
          <div className="flex items-start justify-between mb-4">
            <SectionTitle>Matérias-primas</SectionTitle>
            {totalCost > 0 && (
              <div className="text-right">
                <p className="text-xs text-gray-400 dark:text-gray-500">Custo estimado</p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  R$ {totalCost.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {!isEdit ? (
            <NewHint>Salve o produto primeiro para adicionar matérias-primas.</NewHint>
          ) : (
            <>
              {productMaterials.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">Nenhuma matéria-prima adicionada.</p>
              ) : (
                <div className="space-y-1 mb-3">
                  {productMaterials.map(pm => {
                    const mat = materials.find(m => m.id === pm.material_id);
                    const lineCost = mat ? parseFloat(mat.price_per_gram || 0) * parseFloat(pm.quantity_grams) : 0;
                    return (
                      <div key={pm.material_id} className="flex items-center gap-2 py-2.5 px-3 rounded-lg bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-[#2a2a2a]">
                        <span className="flex-1 text-sm font-medium text-gray-900 dark:text-gray-100">{pm.name}</span>
                        {lineCost > 0 && (
                          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                            R$ {lineCost.toFixed(2)}
                          </span>
                        )}
                        <input
                          type="number"
                          defaultValue={pm.quantity_grams}
                          onBlur={e => handleUpdateMaterialQty(pm.material_id, e.target.value)}
                          className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] px-2 py-1 text-sm w-20 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none tabular-nums text-right"
                          min="0" step="0.1"
                        />
                        <span className="text-xs text-gray-400 dark:text-gray-500">g</span>
                        <button
                          onClick={() => handleRemoveMaterial(pm.material_id)}
                          className="p-1 text-red-400 hover:text-red-600 transition-colors"
                          aria-label="Remover"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2 mt-3">
                <select
                  value={newMat.material_id}
                  onChange={e => setNewMat(m => ({ ...m, material_id: e.target.value }))}
                  className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2 py-1.5 text-sm flex-1 text-gray-900 dark:text-gray-100 outline-none"
                >
                  <option value="">Selecionar material</option>
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} — R${parseFloat(m.price_per_gram || 0).toFixed(3)}/g
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="g"
                  value={newMat.quantity_grams}
                  onChange={e => setNewMat(m => ({ ...m, quantity_grams: e.target.value }))}
                  className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2 py-1.5 text-sm w-20 text-gray-900 dark:text-gray-100 outline-none"
                  min="0" step="0.1"
                />
                <button
                  onClick={handleAddMaterial}
                  disabled={!newMat.material_id || !newMat.quantity_grams}
                  className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Adicionar
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Variants ── */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
          <SectionTitle>Variações do Produto</SectionTitle>

          {!isEdit ? (
            <NewHint>Salve o produto primeiro para adicionar variações.</NewHint>
          ) : (
            <>
              {variantGroups.length === 0 && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-3">
                  Nenhuma variação cadastrada. Ex: "Cor", "Tamanho", "Modelo".
                </p>
              )}

              {/* Existing groups */}
              <div className="space-y-4 mb-4">
                {variantGroups.map(group => (
                  <div key={group.id} className="rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4">
                    {/* Group header */}
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide">
                        {group.name}
                      </p>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        Remover grupo
                      </button>
                    </div>

                    {/* Options pills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(group.options || []).map(opt => (
                        <div key={opt.id} className="flex flex-col gap-1">
                          <div
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                              opt.is_available
                                ? 'border-green-200 dark:border-[#39ff14]/30 bg-green-50 dark:bg-[#39ff14]/10 text-green-800 dark:text-[#39ff14]'
                                : 'border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] text-gray-400 line-through'
                            }`}
                          >
                            {/* Thumbnail if image set */}
                            {opt.image_url && (
                              <img src={opt.image_url} alt="" className="w-5 h-5 rounded object-cover flex-shrink-0" />
                            )}
                            <span className="font-medium">{opt.name}</span>
                            {parseFloat(opt.price_modifier || 0) !== 0 && (
                              <span className="text-xs opacity-70">
                                {parseFloat(opt.price_modifier) > 0 ? '+' : ''}R${parseFloat(opt.price_modifier).toFixed(2)}
                              </span>
                            )}
                            {/* Set image button */}
                            <button
                              onClick={() => setEditingOptImage(editingOptImage === opt.id ? null : opt.id)}
                              title="Definir foto da variação"
                              className="opacity-60 hover:opacity-100 transition-opacity ml-0.5"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleToggleOption(group.id, opt)}
                              title={opt.is_available ? 'Desativar' : 'Ativar'}
                              className="opacity-60 hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                {opt.is_available
                                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  : <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                }
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteOption(group.id, opt.id)}
                              className="opacity-60 hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          {/* Inline image URL editor */}
                          {editingOptImage === opt.id && (
                            <OptionImageEditor
                              defaultValue={opt.image_url || ''}
                              onSave={url => handleSetOptionImage(group.id, opt, url)}
                              onCancel={() => setEditingOptImage(null)}
                            />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add option */}
                    <div className="flex flex-col gap-1.5 mt-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nome da opção (ex: Vermelho)"
                          value={newOptions[group.id]?.name || ''}
                          onChange={e => setNewOptions(p => ({ ...p, [group.id]: { ...p[group.id], name: e.target.value } }))}
                          onKeyDown={e => e.key === 'Enter' && handleAddOption(group.id)}
                          className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <input
                          type="number"
                          placeholder="+R$"
                          step="0.01"
                          value={newOptions[group.id]?.price_modifier || ''}
                          onChange={e => setNewOptions(p => ({ ...p, [group.id]: { ...p[group.id], price_modifier: e.target.value } }))}
                          className="w-20 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
                        />
                        <button
                          onClick={() => handleAddOption(group.id)}
                          disabled={!newOptions[group.id]?.name?.trim()}
                          className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all disabled:opacity-40"
                        >
                          + Opção
                        </button>
                      </div>
                      {/* Optional image URL for new option */}
                      <input
                        type="url"
                        placeholder="URL da foto desta opção (opcional)"
                        value={newOptions[group.id]?.image_url || ''}
                        onChange={e => setNewOptions(p => ({ ...p, [group.id]: { ...p[group.id], image_url: e.target.value } }))}
                        className="w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2.5 py-1.5 text-sm text-gray-500 dark:text-gray-400 outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new group */}
              <div className="flex gap-2 border-t border-gray-100 dark:border-[#2a2a2a] pt-4">
                <input
                  type="text"
                  placeholder="Nome do grupo (ex: Cor, Tamanho, Modelo)"
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                  className="flex-1 rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleAddGroup}
                  disabled={!newGroupName.trim()}
                  className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all disabled:opacity-40"
                >
                  + Grupo
                </button>
              </div>
            </>
          )}
        </div>

        {/* ── Images ── */}
        {/* NOTE: `sort_order` updates are intentionally omitted from MVP UI. */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
          <SectionTitle>Imagens</SectionTitle>

          {!isEdit ? (
            <NewHint>Salve o produto primeiro para adicionar imagens.</NewHint>
          ) : (
            <>
              {/* Image grid */}
              {images.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4">
                  {images.map(img => (
                    <div key={img.id} className="relative w-24 h-24">
                      <img
                        src={img.url}
                        alt=""
                        className={`w-full h-full object-cover rounded-xl ${img.is_primary ? 'ring-2 ring-green-600 dark:ring-[#39ff14]' : ''}`}
                      />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black bg-opacity-50 opacity-0 hover:opacity-100 rounded-xl transition-opacity">
                        {!img.is_primary && (
                          <button
                            onClick={() => handleSetPrimary(img.id)}
                            className="text-white text-[10px] bg-green-600 dark:bg-[#39ff14] dark:text-black px-1.5 py-0.5 rounded font-medium"
                          >
                            Principal
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(img.id)}
                          className="text-white text-[10px] bg-red-600 px-1.5 py-0.5 rounded font-medium"
                        >
                          Remover
                        </button>
                      </div>
                      {img.is_primary && (
                        <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-green-600 dark:bg-[#39ff14] text-white dark:text-black rounded-b-xl font-semibold py-0.5">
                          Principal
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* File preview */}
              {imagePreview && (
                <div className="flex items-center gap-3 mb-3 p-3 bg-gray-50 dark:bg-[#111] rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
                  <img src={imagePreview} alt="preview" className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{uploadFile?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {uploadFile ? `${(uploadFile.size / 1024).toFixed(0)} KB` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => { setImagePreview(null); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Add image controls */}
              <div className="space-y-2">
                {/* File picker */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
                    Fazer upload do computador
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-[#2a2a2a] hover:border-green-500 dark:hover:border-[#39ff14] cursor-pointer transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#111] flex items-center justify-center flex-shrink-0 group-hover:bg-green-50 dark:group-hover:bg-[#39ff14]/10 transition-colors">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-[#39ff14] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-green-700 dark:group-hover:text-[#39ff14] transition-colors">
                        {uploadFile ? uploadFile.name : 'Clique para selecionar imagem'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, WebP — máx. 8MB</p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
                  <span className="text-xs text-gray-400 dark:text-gray-500">ou</span>
                  <div className="flex-1 h-px bg-gray-200 dark:bg-[#2a2a2a]" />
                </div>

                {/* URL input */}
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block uppercase tracking-wide">
                    Colar URL da imagem
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={newImageUrl}
                      onChange={e => { setNewImageUrl(e.target.value); setUploadFile(null); setImagePreview(null); }}
                      className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-3 py-2 text-sm flex-1 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <button
                      onClick={handleAddImage}
                      disabled={savingImage || (!uploadFile && !newImageUrl.trim())}
                      className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      {savingImage ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                      )}
                      {savingImage ? 'Salvando…' : uploadFile ? 'Enviar' : 'Adicionar'}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
