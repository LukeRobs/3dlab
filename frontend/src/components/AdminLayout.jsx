import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/admin/dashboard',     label: 'Dashboard',     icon: '📊' },
  { to: '/admin/produtos',      label: 'Produtos',      icon: '🖨️' },
  { to: '/admin/materiais',     label: 'Materiais',     icon: '🧵' },
  { to: '/admin/categorias',    label: 'Categorias',    icon: '🏷️' },
  { to: '/admin/pedidos',       label: 'Pedidos',       icon: '📦' },
  { to: '/admin/configuracoes', label: 'Configurações', icon: '⚙️' },
];

function SidebarContent({ onNavClick, logout }) {
  const { user } = useAuth();
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="font-display text-2xl text-gray-900 dark:text-gray-100 px-6 py-5">
          ADMIN
        </div>
        {user?.name && (
          <p className="text-xs text-gray-500 dark:text-gray-400 px-6 pb-3">{user.name}</p>
        )}
      </div>
      <nav className="flex-1 py-2">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            onClick={onNavClick}
            className={({ isActive }) =>
              isActive
                ? 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] border-green-600 dark:border-[#39ff14] bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-[#39ff14] pl-[calc(1rem-3px)] transition-colors'
                : 'flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors'
            }
          >
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-gray-200 dark:border-[#2a2a2a] p-4 flex items-center gap-2">
        <ThemeToggle />
        <button
          onClick={logout}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const { logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a] flex-col h-screen sticky top-0">
        <SidebarContent logout={logout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-white dark:bg-[#111111] border-b border-gray-200 dark:border-[#2a2a2a]">
        <span className="font-display text-xl text-gray-900 dark:text-gray-100">ADMIN</span>
        <button
          onClick={() => setDrawerOpen(o => !o)}
          className="text-gray-700 dark:text-gray-300 text-xl"
          aria-label="Menu"
        >
          {drawerOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {drawerOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 h-full w-60 z-50 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-[#2a2a2a] transform transition-transform duration-200 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onNavClick={() => setDrawerOpen(false)} logout={logout} />
      </div>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto bg-gray-50 dark:bg-[#0a0a0a] lg:mt-0 mt-[52px]">
        {children}
      </main>
    </div>
  );
}
