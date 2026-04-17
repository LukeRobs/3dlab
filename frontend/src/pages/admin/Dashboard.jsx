import { useState, useEffect } from 'react';
import {
  Card, Metric, Text, BarChart, Title, BadgeDelta
} from '@tremor/react';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function Dashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setData(r.data));
  }, []);

  if (!data) return <AdminLayout><p>Carregando...</p></AdminLayout>;

  const chartData = (data.top_viewed_products || []).map(p => ({
    name: p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name,
    'Visualizações': p.views_count,
    'Margem %': parseFloat(p.margin_percent) || 0,
  }));

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Metrics row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <Text>Intenções de Compra</Text>
          <Metric>{data.checkout_intents || 0}</Metric>
        </Card>
        <Card>
          <Text>Pedidos Confirmados</Text>
          <Metric>{data.confirmed_orders || 0}</Metric>
        </Card>
        <Card>
          <Text>Pedidos Pendentes</Text>
          <Metric>{data.pending_orders || 0}</Metric>
        </Card>
        <Card>
          <Text>Receita Confirmada</Text>
          <Metric>R$ {parseFloat(data.confirmed_sales_value || 0).toFixed(2)}</Metric>
        </Card>
      </div>

      {/* Top viewed products chart */}
      <Card className="mb-8">
        <Title>Produtos Mais Vistos</Title>
        <BarChart
          data={chartData}
          index="name"
          categories={['Visualizações']}
          colors={['indigo']}
          className="h-64 mt-4"
        />
      </Card>

      {/* Products margin table */}
      <Card>
        <Title>Margem por Produto</Title>
        <table className="w-full text-sm mt-4">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Produto</th>
              <th className="pb-2">Preço</th>
              <th className="pb-2">Custo</th>
              <th className="pb-2">Margem</th>
            </tr>
          </thead>
          <tbody>
            {(data.top_viewed_products || []).map(p => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="py-2">{p.name}</td>
                <td className="py-2">R$ {parseFloat(p.price).toFixed(2)}</td>
                <td className="py-2">R$ {parseFloat(p.cost_calculated).toFixed(2)}</td>
                <td className="py-2">
                  <BadgeDelta deltaType={parseFloat(p.margin_percent) > 30 ? 'increase' : 'decrease'}>
                    {parseFloat(p.margin_percent).toFixed(1)}%
                  </BadgeDelta>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </AdminLayout>
  );
}
