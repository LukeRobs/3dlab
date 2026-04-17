import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';

const STATUS_LABELS = {
  pending:   { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Confirmado', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    api.get('/pedidos').then(r => setPedidos(r.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
        {pedidos.length === 0 ? (
          <p className="text-gray-500">Nenhum pedido ainda.</p>
        ) : (
          <div className="space-y-4">
            {pedidos.map(p => {
              const s = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
              return (
                <div key={p.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Pedido #{p.id.substring(0, 8)}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1 mb-3">
                    {p.items.map(i => (
                      <li key={i.id}>
                        {i.quantity}x {i.product_name} — R$ {parseFloat(i.unit_price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold text-right">Total: R$ {parseFloat(p.total_price).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
