import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const STATUS = {
  pending:   { label: 'Aguardando',  color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
  confirmed: { label: 'Confirmado',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-[#39ff14]' },
  cancelled: { label: 'Cancelado',   color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

function TrashIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
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

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

/* ── Delete confirmation modal ── */
function DeleteModal({ order, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-[#2a2a2a] p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mx-auto mb-4">
          <TrashIcon />
        </div>
        <h2 className="text-center font-semibold text-gray-900 dark:text-gray-100 mb-1">Excluir pedido?</h2>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
          O pedido <span className="font-semibold text-gray-800 dark:text-gray-200">#{order.id.substring(0, 8).toUpperCase()}</span> será permanentemente removido. Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-[#2a2a2a] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Status picker inline ── */
function StatusPicker({ currentStatus, onSelect, onClose }) {
  const options = [
    { key: 'pending',   label: 'Aguardando' },
    { key: 'confirmed', label: 'Confirmado' },
    { key: 'cancelled', label: 'Cancelado' },
  ];
  return (
    <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-xl overflow-hidden min-w-[160px]">
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => { onSelect(o.key); onClose(); }}
          className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-[#222] ${
            currentStatus === o.key ? 'text-green-600 dark:text-[#39ff14]' : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {currentStatus === o.key && <CheckIcon />}
          {currentStatus !== o.key && <span className="w-3.5" />}
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);   // id with status picker open
  const [deleteTarget, setDeleteTarget] = useState(null); // order to delete

  useEffect(() => {
    api.get('/admin/pedidos')
      .then(r => setPedidos(r.data))
      .finally(() => setLoading(false));
  }, []);

  // Close picker when clicking outside
  useEffect(() => {
    if (!editingId) return;
    const handler = () => setEditingId(null);
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [editingId]);

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
        <DeleteModal
          order={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
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
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === f.key
                ? 'bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900'
                : 'bg-white dark:bg-[#1a1a1a] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-[#2a2a2a] hover:border-gray-300'
            }`}
          >
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
          <p className="text-gray-400 dark:text-gray-500 text-sm">Nenhum pedido {filter !== 'all' ? `com status "${STATUS[filter]?.label}"` : 'encontrado'}.</p>
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
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mt-0.5">{p.customer_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{p.customer_email}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {new Date(p.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>

                {/* Actions — always visible */}
                <div className="flex gap-2 flex-shrink-0 items-start">
                  {/* Status picker */}
                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => setEditingId(prev => prev === p.id ? null : p.id)}
                      className="flex items-center gap-1.5 text-xs border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 px-3 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#222] active:scale-95 transition-all"
                    >
                      <PencilIcon />
                      Editar status
                    </button>
                    {editingId === p.id && (
                      <StatusPicker
                        currentStatus={p.status}
                        onSelect={status => updateStatus(p.id, status)}
                        onClose={() => setEditingId(null)}
                      />
                    )}
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => setDeleteTarget(p)}
                    className="flex items-center gap-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-3 py-2 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/40 active:scale-95 transition-all border border-red-100 dark:border-red-800/40"
                  >
                    <TrashIcon />
                    Excluir
                  </button>
                </div>
              </div>

              {/* Items */}
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
