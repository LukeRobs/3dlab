import { useState, useEffect, useRef } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const STATUS = {
  pending:   { label: 'Aguardando',  color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  confirmed: { label: 'Confirmado',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-[#39ff14]' },
  cancelled: { label: 'Cancelado',   color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

/* ── Icons ── */
function TrashIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}

/* ── Delete order confirmation modal ── */
function DeleteModal({ order, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4 text-red-500">
          <TrashIcon />
        </div>
        <h2 className="text-center font-semibold text-gray-900 dark:text-gray-100 mb-1">Excluir pedido?</h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
          O pedido <span className="font-semibold text-gray-800 dark:text-gray-200">#{order.id.substring(0, 8).toUpperCase()}</span> será removido permanentemente.
        </p>
        <div className="flex gap-2">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors">
            Cancelar
          </button>
          <button onClick={onConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors">
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Status picker dropdown ── */
function StatusPicker({ currentStatus, onSelect, onClose }) {
  const opts = [
    { key: 'pending',   label: 'Aguardando' },
    { key: 'confirmed', label: 'Confirmado' },
    { key: 'cancelled', label: 'Cancelado' },
  ];
  return (
    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden min-w-[160px]">
      {opts.map(o => (
        <button key={o.key} onClick={() => { onSelect(o.key); onClose(); }}
          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-[#222] ${
            currentStatus === o.key ? 'text-green-600 dark:text-[#39ff14]' : 'text-gray-700 dark:text-gray-300'
          }`}>
          {currentStatus === o.key
            ? <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            : <span className="w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════
   Edit Order Modal — full item management
══════════════════════════════════════════ */
function EditOrderModal({ order, onClose, onSaved }) {
  const [current, setCurrent] = useState(order); // live order state
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef(null);

  // Load product list for "add product"
  useEffect(() => {
    api.get('/admin/produtos').then(r => setProducts(r.data));
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    if (!showSearch) return;
    const handler = e => { if (!searchRef.current?.contains(e.target)) setShowSearch(false); };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [showSearch]);

  const filtered = search.length >= 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : products.slice(0, 8);

  async function changeQty(item, delta) {
    const newQty = item.quantity + delta;
    if (newQty < 1) return;
    setSaving(true);
    try {
      const { data } = await api.patch(`/admin/pedidos/${current.id}/items/${item.id}`, { quantity: newQty });
      setCurrent(data);
      onSaved(data);
    } finally { setSaving(false); }
  }

  async function removeItem(item) {
    setSaving(true);
    try {
      const { data } = await api.delete(`/admin/pedidos/${current.id}/items/${item.id}`);
      setCurrent(data);
      onSaved(data);
    } finally { setSaving(false); }
  }

  async function addProduct(product) {
    setSearch('');
    setShowSearch(false);
    setSaving(true);
    try {
      const { data } = await api.post(`/admin/pedidos/${current.id}/items`, { product_id: product.id, quantity: 1 });
      setCurrent(data);
      onSaved(data);
    } finally { setSaving(false); }
  }

  async function changeStatus(status) {
    const { data } = await api.put(`/admin/pedidos/${current.id}`, { status });
    setCurrent(prev => ({ ...prev, status: data.status }));
    onSaved({ ...current, status: data.status });
  }

  const s = STATUS[current.status] || STATUS.pending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-[#111] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100 dark:border-[#2a2a2a]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-semibold text-gray-900 dark:text-gray-100">
                Pedido #{current.id.substring(0, 8).toUpperCase()}
              </h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {current.customer_name} · {current.customer_email}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body — scrollable */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">

          {/* Notice when status is not pending */}
          {current.status !== 'pending' && (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/40 rounded-xl px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Ao adicionar ou remover produtos, o status voltará automaticamente para <strong className="ml-1">Aguardando</strong>.
            </div>
          )}

          {/* Items list */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Produtos</p>
            {current.items.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4 border border-dashed border-gray-200 dark:border-[#2a2a2a] rounded-xl">
                Nenhum produto neste pedido
              </p>
            )}
            <div className="space-y-2">
              {current.items.map(item => (
                <div key={item.id} className="flex items-center gap-3 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-100 dark:border-[#2a2a2a] rounded-xl p-3">
                  {/* Name + price */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{item.product_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">R$ {parseFloat(item.unit_price).toFixed(2)} / un</p>
                  </div>

                  {/* Subtotal */}
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-20 text-right flex-shrink-0">
                    R$ {(item.quantity * parseFloat(item.unit_price)).toFixed(2)}
                  </span>

                  {/* Qty controls */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => changeQty(item, -1)} disabled={saving || item.quantity <= 1}
                      className="w-7 h-7 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 font-bold disabled:opacity-40 transition-colors text-base leading-none">
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">{item.quantity}</span>
                    <button onClick={() => changeQty(item, +1)} disabled={saving}
                      className="w-7 h-7 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-400 font-bold disabled:opacity-40 transition-colors text-base leading-none">
                      +
                    </button>
                  </div>

                  {/* Remove */}
                  <button onClick={() => removeItem(item)} disabled={saving}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add product */}
          <div ref={searchRef} className="relative">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Adicionar produto</p>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl px-3 py-2.5 focus-within:border-green-500 dark:focus-within:border-[#39ff14]/60 transition-colors">
              <SearchIcon />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSearch(true); }}
                onFocus={() => setShowSearch(true)}
                placeholder="Buscar produto pelo nome…"
                className="flex-1 bg-transparent outline-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>

            {showSearch && (
              <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden">
                {filtered.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-4">Nenhum produto encontrado</p>
                )}
                {filtered.map(prod => (
                  <button key={prod.id} onClick={() => addProduct(prod)} disabled={saving}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors text-left border-b border-gray-100 dark:border-[#2a2a2a] last:border-0">
                    {prod.primary_image ? (
                      <img src={prod.primary_image} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-[#2a2a2a]" />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] flex-shrink-0" />
                    )}
                    <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{prod.name}</span>
                    <span className="text-sm font-semibold text-green-600 dark:text-[#39ff14] flex-shrink-0">R$ {parseFloat(prod.price).toFixed(2)}</span>
                    <PlusIcon />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Status do pedido</p>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'pending',   label: 'Aguardando' },
                { key: 'confirmed', label: 'Confirmado' },
                { key: 'cancelled', label: 'Cancelado' },
              ].map(o => (
                <button key={o.key} onClick={() => changeStatus(o.key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all active:scale-95 ${
                    current.status === o.key
                      ? 'border-green-600 dark:border-[#39ff14] bg-green-600 dark:bg-[#39ff14] text-white dark:text-black'
                      : 'border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-[#3a3a3a]'
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — total */}
        <div className="border-t border-gray-100 dark:border-[#2a2a2a] px-5 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">{current.items.reduce((s, i) => s + i.quantity, 0)} item(s)</span>
          <p className="text-base font-bold text-gray-900 dark:text-gray-100">
            Total: <span className="text-green-600 dark:text-[#39ff14]">R$ {parseFloat(current.total_price).toFixed(2)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════
   Main Page
══════════════════════════════════════════ */
export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingOrder, setEditingOrder] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [statusPickerId, setStatusPickerId] = useState(null);

  useEffect(() => {
    api.get('/admin/pedidos')
      .then(r => setPedidos(r.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!statusPickerId) return;
    const handler = () => setStatusPickerId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [statusPickerId]);

  function handleSaved(updatedOrder) {
    setPedidos(prev => prev.map(p => p.id === updatedOrder.id ? { ...p, ...updatedOrder } : p));
    if (editingOrder?.id === updatedOrder.id) setEditingOrder(updatedOrder);
  }

  async function updateStatus(id, status) {
    const { data } = await api.put(`/admin/pedidos/${id}`, { status });
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: data.status } : p));
  }

  async function confirmDelete() {
    await api.delete(`/admin/pedidos/${deleteTarget.id}`);
    setPedidos(prev => prev.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  }

  const filtered = filter === 'all' ? pedidos : pedidos.filter(p => p.status === filter);
  const counts = {
    all: pedidos.length,
    pending: pedidos.filter(p => p.status === 'pending').length,
    confirmed: pedidos.filter(p => p.status === 'confirmed').length,
    cancelled: pedidos.filter(p => p.status === 'cancelled').length,
  };

  return (
    <AdminLayout>
      {deleteTarget && (
        <DeleteModal order={deleteTarget} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}
      {editingOrder && (
        <EditOrderModal order={editingOrder} onClose={() => setEditingOrder(null)} onSaved={handleSaved} />
      )}

      <div className="mb-6">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Pedidos</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} no total</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: 'all',       label: 'Todos' },
          { key: 'pending',   label: 'Aguardando' },
          { key: 'confirmed', label: 'Confirmados' },
          { key: 'cancelled', label: 'Cancelados' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300'
            }`}>
            {f.label}
            {counts[f.key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                filter === f.key
                  ? 'bg-white/20 text-white dark:bg-black/20 dark:text-gray-900'
                  : 'bg-gray-100 dark:bg-[#2a2a2a] text-gray-600 dark:text-gray-400'
              }`}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />)}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a]">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhum pedido encontrado.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(p => {
          const s = STATUS[p.status] || STATUS.pending;
          return (
            <div key={p.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 transition-colors hover:border-gray-300 dark:hover:border-[#3a3a3a]">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                      #{p.id.substring(0, 8).toUpperCase()}
                    </p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>{s.label}</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-0.5">{p.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.customer_email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(p.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>

                <div className="flex gap-2 flex-shrink-0 items-start">
                  {/* Edit order */}
                  <button onClick={() => setEditingOrder(p)}
                    className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#222] active:scale-95 transition-all">
                    <PencilIcon />
                    Editar
                  </button>

                  {/* Delete */}
                  <button onClick={() => setDeleteTarget(p)}
                    className="flex items-center gap-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-3 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all border border-red-100 dark:border-red-800/40">
                    <TrashIcon className="w-3.5 h-3.5" />
                    Excluir
                  </button>
                </div>
              </div>

              {/* Items summary */}
              <div className="bg-gray-50 dark:bg-[#111] rounded-lg p-3 space-y-1.5 mb-3">
                {p.items.map(i => (
                  <div key={i.id} className="flex items-center justify-between text-xs">
                    <span className="text-gray-700 dark:text-gray-300">
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{i.quantity}×</span> {i.product_name}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">
                      R$ {parseFloat(i.unit_price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  Total: <span className="text-green-600 dark:text-[#39ff14]">R$ {parseFloat(p.total_price).toFixed(2)}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
