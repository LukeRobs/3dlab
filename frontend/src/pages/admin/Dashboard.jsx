import { useState, useEffect } from 'react';
import { BarChart, Title } from '@tremor/react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) return <AdminLayout><p className="text-gray-500 dark:text-gray-400">Carregando...</p></AdminLayout>;

  const chartData = (data.top_viewed_products || []).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    'Visualizações': p.views_count,
  }));

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const metrics = [
    { label: 'Intenções',  icon: '🛒', value: data.checkout_intents || 0 },
    { label: 'Confirmados', icon: '✅', value: data.confirmed_orders || 0 },
    { label: 'Pendentes',  icon: '⏳', value: data.pending_orders || 0 },
    { label: 'Receita',    icon: '💰', value: `R$ ${parseFloat(data.confirmed_sales_value || 0).toFixed(2)}` },
  ];

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">Bom dia, Admin 👋</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{today}</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              <span className="mr-1">{m.icon}</span>{m.label}
            </p>
            <p className="font-display text-4xl text-gray-900 dark:text-gray-100">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Top viewed products chart */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 mb-8">
        <Title>Produtos Mais Vistos</Title>
        <BarChart
          data={chartData}
          index="name"
          categories={['Visualizações']}
          colors={['emerald']}
          className="h-64 mt-4"
        />
      </div>

      {/* Margin table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
        <Title>Margem por Produto</Title>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-[#2a2a2a]">
              <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Produto</th>
              <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Preço</th>
              <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Custo</th>
              <th className="pb-2 text-gray-500 dark:text-gray-400 font-medium">Margem</th>
            </tr>
          </thead>
          <tbody>
            {(data.top_viewed_products || []).map(p => {
              const margin = parseFloat(p.margin_percent);
              const marginClass = margin > 40
                ? 'text-green-600 dark:text-[#39ff14]'
                : margin >= 20
                ? 'text-yellow-500'
                : 'text-red-500';
              return (
                <tr key={p.id} className="border-b border-gray-200 dark:border-[#2a2a2a] last:border-0">
                  <td className="py-2 text-gray-900 dark:text-gray-100">{p.name}</td>
                  <td className="py-2 text-gray-700 dark:text-gray-300">R$ {parseFloat(p.price).toFixed(2)}</td>
                  <td className="py-2 text-gray-700 dark:text-gray-300">R$ {parseFloat(p.cost_calculated).toFixed(2)}</td>
                  <td className={`py-2 font-semibold ${marginClass}`}>{margin.toFixed(1)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
