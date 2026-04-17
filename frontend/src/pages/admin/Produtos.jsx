import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function AdminProdutos() {
  const [produtos, setProdutos] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get('/admin/produtos').then(r => setProdutos(r.data)); }, []);

  async function handleDelete(produto) {
    if (!confirm(`Deletar "${produto.name}"?`)) return;
    try {
      const res = await api.delete(`/admin/produtos/${produto.id}`);
      if (res.status === 200) {
        // soft deleted — update is_active in local list
        setProdutos(prev => prev.map(p => p.id === produto.id ? { ...p, is_active: false } : p));
        setToast('Produto desativado (possui histórico de pedidos)');
      } else {
        setProdutos(prev => prev.filter(p => p.id !== produto.id));
        setToast('Produto excluído');
      }
    } catch (err) {
      setToast(err.response?.data?.error || 'Erro ao excluir');
    }
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Link to="/admin/produtos/novo" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          + Novo Produto
        </Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Preço</th>
              <th className="text-left px-4 py-3">Custo</th>
              <th className="text-left px-4 py-3">Views</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3">R$ {parseFloat(p.price).toFixed(2)}</td>
                <td className="px-4 py-3">R$ {parseFloat(p.cost_calculated).toFixed(2)}</td>
                <td className="px-4 py-3">{p.views_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <Link to={`/admin/produtos/${p.id}`} className="text-indigo-600 hover:underline">Editar</Link>
                  <button onClick={() => handleDelete(p)} className="text-red-500 hover:text-red-700">Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {toast && <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded">{toast}</div>}
    </AdminLayout>
  );
}
