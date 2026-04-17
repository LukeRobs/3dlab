import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';

const links = [
  { to: '/admin/dashboard',    label: 'Dashboard' },
  { to: '/admin/produtos',     label: 'Produtos' },
  { to: '/admin/materiais',    label: 'Materiais' },
  { to: '/admin/categorias',   label: 'Categorias' },
  { to: '/admin/pedidos',      label: 'Pedidos' },
  { to: '/admin/configuracoes', label: 'Configurações' },
];

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-56 bg-gray-900 text-white flex flex-col">
        <div className="px-4 py-5 font-bold text-lg border-b border-gray-700">Admin</div>
        <nav className="flex-1 py-4">
          {links.map(l => (
            <NavLink
              key={l.to} to={l.to}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm hover:bg-gray-700 ${isActive ? 'bg-gray-700' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="px-4 py-3 text-sm text-gray-400 hover:text-white border-t border-gray-700">
          Sair
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">{children}</main>
    </div>
  );
}
