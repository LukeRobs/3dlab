import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import AdminLayout from '../../components/AdminLayout';

export default function Materiais() {
  const [materiais, setMateriais] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => { api.get('/admin/materiais').then(r => setMateriais(r.data)); }, []);

  async function handleDelete(m) {
    if (!confirm(`Deletar "${m.name}"?`)) return;
    try {
      await api.delete(`/admin/materiais/${m.id}`);
      setMateriais(prev => prev.filter(x => x.id !== m.id));
      setToast('Material excluído');
    } catch (err) {
      setToast(err.response?.data?.error || 'Erro ao excluir');
    }
    setTimeout(() => setToast(null), 3000);
  }

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Matérias-primas</h1>
        <Link to="/admin/materiais/novo" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">+ Novo</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Preço/g (R$)</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {materiais.map(m => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="px-4 py-3">{m.name}</td>
                <td className="px-4 py-3 capitalize">{m.type}</td>
                <td className="px-4 py-3">{parseFloat(m.price_per_gram).toFixed(4)}</td>
                <td className="px-4 py-3 flex gap-2 justify-end">
                  <Link to={`/admin/materiais/${m.id}`} className="text-indigo-600 hover:underline">Editar</Link>
                  <button onClick={() => handleDelete(m)} className="text-red-500 hover:text-red-700">Excluir</button>
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
