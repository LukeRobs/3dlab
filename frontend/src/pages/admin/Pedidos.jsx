import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const STATUS = {
  pending:   { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmado',             color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelado',              color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function AdminPedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => { api.get('/admin/pedidos').then(r => setPedidos(r.data)); }, []);

  async function updateStatus(id, status) {
    const { data } = await api.put(`/admin/pedidos/${id}`, { status });
    setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: data.status } : p));
  }

  return (
    <AdminLayout>
      <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Pedidos</h1>
      <div>
        {pedidos.map(p => {
          const s = STATUS[p.status] || STATUS.pending;
          return (
            <div key={p.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 mb-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    #{p.id.substring(0, 8)} — {p.customer_name}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{p.customer_email}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(p.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
                    {s.label}
                  </span>
                  {p.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(p.id, 'confirmed')}
                        className="text-xs bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-3 py-1.5 rounded-lg font-medium hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
                      >
                        Confirmar
                      </button>
                      <button
                        onClick={() => updateStatus(p.id, 'cancelled')}
                        className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-red-600 active:scale-95 transition-all"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                {p.items.map(i => (
                  <li key={i.id}>{i.quantity}× {i.product_name} — R$ {parseFloat(i.unit_price).toFixed(2)}</li>
                ))}
              </ul>
              <p className="text-right font-semibold text-gray-900 dark:text-gray-100">
                Total: R$ {parseFloat(p.total_price).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
