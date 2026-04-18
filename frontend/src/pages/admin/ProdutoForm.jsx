import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const inputClass = 'w-full rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-4 py-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none';

export default function ProdutoForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', slug: '', description: '', price: '', print_time_minutes: 0, category_id: '', is_active: true });
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [productMaterials, setProductMaterials] = useState([]);
  const [images, setImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newMat, setNewMat] = useState({ material_id: '', quantity_grams: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/categorias').then(r => setCategories(r.data));
    api.get('/admin/materiais').then(r => setMaterials(r.data));
    if (isEdit) {
      api.get(`/admin/produtos/${id}`).then(r => {
        const p = r.data;
        setForm({ name: p.name, slug: p.slug, description: p.description || '', price: p.price, print_time_minutes: p.print_time_minutes, category_id: p.category_id || '', is_active: p.is_active });
        setImages(p.images || []);
        setProductMaterials(p.product_materials || []);
      });
    }
  }, [id, isEdit]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit) {
        await api.put(`/admin/produtos/${id}`, form);
      } else {
        await api.post('/admin/produtos', form);
      }
      navigate('/admin/produtos');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao salvar produto');
    }
  }

  async function handleAddMaterial() {
    if (!newMat.material_id || !newMat.quantity_grams) return;
    await api.post(`/admin/produtos/${id}/materiais`, { material_id: newMat.material_id, quantity_grams: parseFloat(newMat.quantity_grams) });
    const r = await api.get(`/admin/produtos/${id}`);
    setProductMaterials(r.data.product_materials);
    setNewMat({ material_id: '', quantity_grams: '' });
  }

  async function handleUpdateMaterialQty(matId, newQty) {
    if (!newQty || parseFloat(newQty) <= 0) return;
    await api.put(`/admin/produtos/${id}/materiais/${matId}`, { quantity_grams: parseFloat(newQty) });
    setProductMaterials(prev => prev.map(m => m.material_id === matId ? { ...m, quantity_grams: newQty } : m));
  }

  async function handleRemoveMaterial(matId) {
    await api.delete(`/admin/produtos/${id}/materiais/${matId}`);
    setProductMaterials(prev => prev.filter(m => m.material_id !== matId));
  }

  async function handleAddImage() {
    if (!newImageUrl) return;
    await api.post(`/admin/produtos/${id}/images`, { url: newImageUrl });
    const r = await api.get(`/admin/produtos/${id}`);
    setImages(r.data.images);
    setNewImageUrl('');
  }

  async function handleSetPrimary(imgId) {
    await api.put(`/admin/produtos/${id}/images/${imgId}`, { is_primary: true });
    setImages(prev => prev.map(i => ({ ...i, is_primary: i.id === imgId })));
  }

  async function handleRemoveImage(imgId) {
    await api.delete(`/admin/produtos/${id}/images/${imgId}`);
    setImages(prev => prev.filter(i => i.id !== imgId));
  }

  function handleField(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">
        {isEdit ? 'Editar Produto' : 'Novo Produto'}
      </h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 mb-6 space-y-4">
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Informações do Produto</p>

          {[
            { label: 'Nome', name: 'name', type: 'text', required: true },
            { label: 'Slug (URL)', name: 'slug', type: 'text', required: true },
            { label: 'Preço (R$)', name: 'price', type: 'number', step: '0.01', required: true },
            { label: 'Tempo de impressão (min)', name: 'print_time_minutes', type: 'number' },
          ].map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
              <input
                {...field} value={form[field.name]} onChange={handleField}
                className={inputClass}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição</label>
            <textarea
              name="description" value={form.description} onChange={handleField} rows={3}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoria</label>
            <select
              name="category_id" value={form.category_id} onChange={handleField}
              className={inputClass}
            >
              <option value="">Sem categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {isEdit && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleField} />
              <span className="text-sm text-gray-700 dark:text-gray-300">Produto ativo (visível no catálogo)</span>
            </label>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
            >
              {isEdit ? 'Salvar' : 'Criar Produto'}
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

      {/* Material assignment — only shown in edit mode */}
      {isEdit && (
        <>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 mb-6">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Matérias-primas</p>
            {productMaterials.map(pm => (
              <div key={pm.material_id} className="flex items-center gap-2 py-2 border-b border-gray-200 dark:border-[#2a2a2a]">
                <span className="flex-1 text-sm text-gray-900 dark:text-gray-100">{pm.name}</span>
                <input
                  type="number"
                  defaultValue={pm.quantity_grams}
                  onBlur={e => handleUpdateMaterialQty(pm.material_id, e.target.value)}
                  className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2 py-1 text-sm w-24 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">g</span>
                <button
                  onClick={() => handleRemoveMaterial(pm.material_id)}
                  className="text-red-500 dark:text-red-400 text-sm hover:text-red-700 transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
            <div className="flex gap-2 mt-3">
              <select
                value={newMat.material_id}
                onChange={e => setNewMat(m => ({ ...m, material_id: e.target.value }))}
                className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2 py-1.5 text-sm flex-1 text-gray-900 dark:text-gray-100 outline-none"
              >
                <option value="">Selecionar material</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input
                type="number"
                placeholder="Gramas"
                value={newMat.quantity_grams}
                onChange={e => setNewMat(m => ({ ...m, quantity_grams: e.target.value }))}
                className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-2 py-1.5 text-sm w-24 text-gray-900 dark:text-gray-100 outline-none"
              />
              <button
                onClick={handleAddMaterial}
                className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* NOTE: `sort_order` updates via PUT /images/:imgId are intentionally omitted from MVP UI.
               Images are ordered server-side by is_primary DESC, sort_order ASC, created_at ASC.
               Admins can set the primary image; reordering by sort_order is a post-MVP feature. */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
            <p className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Imagens</p>
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map(img => (
                <div key={img.id} className="relative w-24 h-24">
                  <img
                    src={img.url}
                    alt=""
                    className={`w-full h-full object-cover rounded-lg ${img.is_primary ? 'ring-2 ring-green-600 dark:ring-[#39ff14]' : ''}`}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black bg-opacity-40 opacity-0 hover:opacity-100 rounded-lg transition-opacity">
                    {!img.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(img.id)}
                        className="text-white text-xs bg-green-600 dark:bg-[#39ff14] dark:text-black px-1.5 py-0.5 rounded"
                      >
                        Principal
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveImage(img.id)}
                      className="text-white text-xs bg-red-600 px-1.5 py-0.5 rounded"
                    >
                      Remover
                    </button>
                  </div>
                  {img.is_primary && (
                    <span className="absolute bottom-0 left-0 right-0 text-center text-xs bg-green-600 dark:bg-[#39ff14] text-white dark:text-black rounded-b-lg">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="URL da imagem"
                value={newImageUrl}
                onChange={e => setNewImageUrl(e.target.value)}
                className="rounded-lg border border-gray-200 dark:border-[#2a2a2a] bg-gray-50 dark:bg-[#111] px-3 py-2 text-sm flex-1 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button
                onClick={handleAddImage}
                className="bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 dark:hover:bg-[#2bcc0f] transition-all"
              >
                Adicionar
              </button>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
