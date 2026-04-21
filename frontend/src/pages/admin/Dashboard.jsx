import { useState, useEffect } from 'react';
import { BarChart, Title } from '@tremor/react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

function MetricIcon({ type }) {
  const icons = {
    cart: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
    ),
    check: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    clock: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    money: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };
  return icons[type] || null;
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 dark:bg-[#1a1a1a] rounded animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({length:4}).map((_,i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  const chartData = (data.top_viewed_products || []).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    'Visualizações': p.views_count,
  }));

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const metrics = [
    { label: 'Intenções',   iconType: 'cart',  value: data.checkout_intents || 0,   color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/30' },
    { label: 'Confirmados', iconType: 'check', value: data.confirmed_orders || 0,   color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-[#39ff14]', border: 'border-green-100 dark:border-green-900/30' },
    { label: 'Pendentes',   iconType: 'clock', value: data.pending_orders || 0,     color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/30' },
    { label: 'Receita',     iconType: 'money', value: `R$ ${parseFloat(data.confirmed_sales_value || 0).toFixed(2)}`, color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/30' },
  ];

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">
          {greeting}, Admin!
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{today}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <div key={m.label} className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{m.label}</p>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color} border ${m.border}`}>
                <MetricIcon type={m.iconType} />
              </div>
            </div>
            <p className="font-display text-3xl text-gray-900 dark:text-gray-100 leading-none">{m.value}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-5 bg-green-600 dark:bg-[#39ff14] rounded-full" />
          <Title className="text-gray-900 dark:text-gray-100 font-semibold">Produtos Mais Vistos</Title>
        </div>
        <BarChart
          data={chartData}
          index="name"
          categories={['Visualizações']}
          colors={['emerald']}
          className="h-56 mt-4"
        />
      </div>

      {/* Margin table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center gap-2">
          <div className="w-1 h-5 bg-green-600 dark:bg-[#39ff14] rounded-full" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Margem por Produto</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-[#111]">
              <tr>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Produto</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Preço</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Custo</th>
                <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Margem</th>
              </tr>
            </thead>
            <tbody>
              {(data.top_viewed_products || []).map(p => {
                const margin = parseFloat(p.margin_percent);
                const marginClass = margin > 40
                  ? 'text-green-600 dark:text-[#39ff14] bg-green-50 dark:bg-green-900/20'
                  : margin >= 20
                  ? 'text-amber-600 bg-amber-50 dark:bg-amber-900/20'
                  : 'text-red-600 bg-red-50 dark:bg-red-900/20';
                return (
                  <tr key={p.id} className="border-t border-gray-100 dark:border-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
                    <td className="px-6 py-3 font-medium text-gray-900 dark:text-gray-100">{p.name}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">R$ {parseFloat(p.price).toFixed(2)}</td>
                    <td className="px-6 py-3 text-gray-600 dark:text-gray-300">R$ {parseFloat(p.cost_calculated).toFixed(2)}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${marginClass}`}>
                        {margin.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
