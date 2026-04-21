import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
    eye: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
  };
  return icons[type] || null;
}

// Custom bar chart — zero dependency, dark-mode-safe
function ViewsBarChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        Sem dados de visualização ainda.
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.views));
  if (maxVal === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-600 text-sm">
        Nenhuma visualização registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-2">
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.views / maxVal) * 100 : 0;
        return (
          <div key={i} className="group">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <span
                className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1 font-medium"
                title={item.name}
              >
                {item.name}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums flex-shrink-0">
                {item.views}
              </span>
            </div>
            <div className="h-2.5 w-full bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-green-500 dark:bg-[#39ff14] transition-all duration-700"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-[#1a1a1a] rounded-lg animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-64 bg-gray-200 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />
            <div className="h-64 bg-gray-200 dark:bg-[#1a1a1a] rounded-xl animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';

  const metrics = [
    {
      label: 'Intenções de Compra',
      iconType: 'cart',
      value: data.checkout_intents || 0,
      iconBg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30',
    },
    {
      label: 'Pedidos Confirmados',
      iconType: 'check',
      value: data.confirmed_orders || 0,
      iconBg: 'bg-green-50 dark:bg-[#39ff14]/10',
      iconColor: 'text-green-600 dark:text-[#39ff14]',
      border: 'border-green-100 dark:border-[#39ff14]/20',
    },
    {
      label: 'Pedidos Pendentes',
      iconType: 'clock',
      value: data.pending_orders || 0,
      iconBg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30',
    },
    {
      label: 'Receita Confirmada',
      iconType: 'money',
      value: `R$ ${parseFloat(data.confirmed_sales_value || 0).toFixed(2)}`,
      iconBg: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-100 dark:border-purple-900/30',
    },
  ];

  const topProducts = data.top_viewed_products || [];
  const chartData = topProducts.map(p => ({
    name: p.name.length > 28 ? p.name.substring(0, 28) + '…' : p.name,
    views: p.views_count,
  }));

  return (
    <AdminLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-gray-900 dark:text-gray-100">
            {greeting}, Admin!
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 capitalize">{today}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Link
            to="/admin/produtos/novo"
            className="inline-flex items-center gap-1.5 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Novo Produto
          </Link>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map(m => (
          <div
            key={m.label}
            className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${m.iconBg} ${m.iconColor} border ${m.border}`}>
                <MetricIcon type={m.iconType} />
              </div>
            </div>
            <div>
              <p className="font-display text-3xl text-gray-900 dark:text-gray-100 leading-none mb-1">
                {m.value}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{m.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Views chart */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-green-600 dark:bg-[#39ff14] rounded-full" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Produtos Mais Vistos</h2>
            <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
              <MetricIcon type="eye" />
              Visualizações
            </div>
          </div>
          <ViewsBarChart data={chartData} />
        </div>

        {/* Quick links */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-5 bg-green-600 dark:bg-[#39ff14] rounded-full" />
            <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Ações Rápidas</h2>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Gerenciar Produtos', to: '/admin/produtos', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10', color: 'text-green-600 dark:text-[#39ff14] bg-green-50 dark:bg-[#39ff14]/10' },
              { label: 'Ver Pedidos', to: '/admin/pedidos', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Vitrine / Seções', to: '/admin/vitrine', icon: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Configurações', to: '/admin/configuracoes', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', color: 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-[#111]' },
            ].map(item => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[#222] transition-colors group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  {item.label}
                </span>
                <svg className="w-4 h-4 ml-auto text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Margin table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-[#2a2a2a] flex items-center gap-2">
          <div className="w-1 h-5 bg-green-600 dark:bg-[#39ff14] rounded-full" />
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Margem por Produto</h2>
          <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
            {topProducts.length} produtos
          </span>
        </div>

        {topProducts.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400 dark:text-gray-600 text-sm">
            Nenhum produto cadastrado ainda.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-[#111]">
                <tr>
                  <th className="text-left px-6 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Produto</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Preço</th>
                  <th className="text-right px-4 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Custo</th>
                  <th className="text-right px-6 py-3 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 font-medium">Margem</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map(p => {
                  const margin = parseFloat(p.margin_percent || 0);
                  const marginColor = margin > 40
                    ? 'text-green-700 dark:text-[#39ff14] bg-green-50 dark:bg-[#39ff14]/10'
                    : margin >= 20
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20'
                    : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
                  const barColor = margin > 40 ? 'bg-green-500 dark:bg-[#39ff14]' : margin >= 20 ? 'bg-amber-500' : 'bg-red-500';
                  return (
                    <tr key={p.id} className="border-t border-gray-100 dark:border-[#1f1f1f] hover:bg-gray-50 dark:hover:bg-[#151515] transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">{p.name}</div>
                        <div className="h-1 w-full bg-gray-100 dark:bg-[#111] rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${Math.min(100, Math.max(0, margin))}%` }} />
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-600 dark:text-gray-300 font-medium">
                        R$ {parseFloat(p.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right tabular-nums text-gray-600 dark:text-gray-300 font-medium">
                        R$ {parseFloat(p.cost_calculated || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold tabular-nums ${marginColor}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
