import { useState, useEffect } from 'react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

const STATUS = {
  pending:   { label: 'Pendente',    color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado',  color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado',   color: 'bg-red-100 text-red-800' },
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
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>
      <div className="space-y-4">
        {pedidos.map(p => {
          const s = STATUS[p.status];
          return (
            <div key={p.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">#{p.id.substring(0, 8)} — {p.customer_name}</p>
                  <p className="text-sm text-gray-500">{p.customer_email}</p>
                  <p className="text-sm text-gray-400">{new Date(p.created_at).toLocaleString('pt-BR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>{s.label}</span>
                  {p.status === 'pending' && (
                    <>
                      <button onClick={() => updateStatus(p.id, 'confirmed')} className="text-xs bg-green-600 text-white px-2 py-1 rounded">Confirmar</button>
                      <button onClick={() => updateStatus(p.id, 'cancelled')} className="text-xs bg-red-500 text-white px-2 py-1 rounded">Cancelar</button>
                    </>
                  )}
                </div>
              </div>
              <ul className="text-sm text-gray-700 space-y-1 mb-2">
                {p.items.map(i => (
                  <li key={i.id}>{i.quantity}x {i.product_name} — R$ {parseFloat(i.unit_price).toFixed(2)}</li>
                ))}
              </ul>
              <p className="text-right font-semibold">Total: R$ {parseFloat(p.total_price).toFixed(2)}</p>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
}
