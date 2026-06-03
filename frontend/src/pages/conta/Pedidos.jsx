import { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const STATUS_LABELS = {
  pending:   { label: 'Aguardando confirmação', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  confirmed: { label: 'Confirmado',             color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelado',              color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
};

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    api.get('/pedidos').then(r => setPedidos(r.data));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100 mb-6">Meus Pedidos</h1>
        {pedidos.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">Nenhum pedido ainda.</p>
        ) : (
          <div>
            {pedidos.map(p => {
              const s = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
              return (
                <div key={p.id} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 mb-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        #{p.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mb-3">
                    {p.items.map(i => (
                      <li key={i.id}>
                        {i.quantity}× {i.product_name} — R$ {parseFloat(i.unit_price).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                  <p className="font-semibold text-right text-gray-900 dark:text-gray-100">
                    Total: R$ {parseFloat(p.total_price).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
