import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../lib/auth';
import { getLocalCart } from '../lib/cart';
import api from '../lib/api';
import ThemeToggle from './ThemeToggle';

const DEFAULT_MSGS = [
  'Frete grátis a partir de <strong class="text-[#39ff14]">R$ 300,00</strong>',
  '5% OFF na primeira compra — Cupom: <strong class="text-[#39ff14]">3DMAX</strong>',
  '10% de desconto pagando no <strong class="text-[#39ff14]">PIX</strong>',
];

// Printer SVG icon
function PrinterIcon() {
  return (
    <svg
      className="w-6 h-6 text-green-600 dark:text-[#39ff14]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
    </svg>
  );
}

function CartIcon({ count }) {
  return (
    <Link to="/carrinho" className="relative flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors">
      <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold px-1 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black">
          {count}
        </span>
      )}
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
    </svg>
  );
}

function HamburgerIcon({ open }) {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      )}
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Cart count
  const [dbCartCount, setDbCartCount] = useState(0);
  useEffect(() => {
    if (user) {
      api.get('/carrinho').then(r => {
        setDbCartCount(r.data.reduce((s, i) => s + i.quantity, 0));
      }).catch(() => {});
    }
  }, [user]);
  const cartCount = user
    ? dbCartCount
    : getLocalCart().reduce((s, i) => s + i.quantity, 0);

  // Announcement bar messages — fetched from API, fallback to defaults
  const [announceMsgs, setAnnounceMsgs] = useState(DEFAULT_MSGS);
  useEffect(() => {
    api.get('/configuracoes').then(r => {
      const msgs = [r.data.announce_msg_1, r.data.announce_msg_2, r.data.announce_msg_3]
        .filter(Boolean);
      if (msgs.length > 0) setAnnounceMsgs(msgs);
    }).catch(() => {});
  }, []);

  // Announcement bar rotation
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setMsgIdx(i => (i + 1) % announceMsgs.length), 4000);
    return () => clearInterval(t);
  }, [announceMsgs.length]);

  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Mobile search expand
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const debounceRef = useRef(null);
  const searchWrapperRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Debounced search
  const handleSearchChange = useCallback((value) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) {
      setResults([]);
      setDropdownOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/produtos?search=${encodeURIComponent(value.trim())}`);
        setResults(data.slice(0, 6));
        setDropdownOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  // Click-outside closes dropdown
  useEffect(() => {
    function handleClick(e) {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) {
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Escape key closes dropdown
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Focus mobile input when it opens
  useEffect(() => {
    if (mobileSearchOpen && mobileInputRef.current) {
      mobileInputRef.current.focus();
    }
  }, [mobileSearchOpen]);

  function handleResultClick(slug) {
    setDropdownOpen(false);
    setQuery('');
    setResults([]);
    setMobileSearchOpen(false);
    navigate(`/produto/${slug}`);
  }

  function handleLogout() {
    logout();
    navigate('/');
    setDrawerOpen(false);
  }

  function formatPrice(price) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  }

  // Shared search dropdown
  function SearchDropdown() {
    if (!dropdownOpen || results.length === 0) return null;
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-xl shadow-lg z-50 overflow-hidden">
        {results.map(p => (
          <button
            key={p.id}
            onMouseDown={() => handleResultClick(p.slug)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-[#111111] transition-colors text-left"
          >
            {p.primary_image ? (
              <img
                src={p.primary_image}
                alt={p.name}
                className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-gray-200 dark:border-[#2a2a2a]"
              />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-[#111111] flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</p>
              <p className="text-xs text-green-600 dark:text-[#39ff14] font-semibold">{formatPrice(p.price)}</p>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-40">
        {/* Rotating announcement bar */}
        <div className="bg-gray-900 dark:bg-black text-white py-2 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center justify-center min-h-[24px]">
            <div
              key={msgIdx}
              className="flex items-center gap-2 animate-fade-in"
            >
              <span
                className="text-xs font-semibold tracking-wide uppercase whitespace-nowrap"
                dangerouslySetInnerHTML={{ __html: announceMsgs[msgIdx] || '' }}
              />
            </div>
          </div>
        </div>

      <nav className="bg-white/90 dark:bg-[#0a0a0a]/90 backdrop-blur-md border-b border-gray-200 dark:border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4">
          {/* Desktop row */}
          <div className="hidden md:flex items-center gap-4 h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0 mr-2">
              <PrinterIcon />
              <span className="font-display text-2xl text-gray-900 dark:text-gray-100 leading-none tracking-wide">
                LOJA GEEK 3D
              </span>
            </Link>

            {/* Search bar — centered, flex-1 */}
            <div ref={searchWrapperRef} className="flex-1 relative">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <SearchIcon />
                </span>
                <input
                  type="text"
                  value={query}
                  onChange={e => handleSearchChange(e.target.value)}
                  placeholder="Buscar produtos..."
                  className="w-full h-9 pl-9 pr-4 rounded-lg text-sm bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-[#39ff14] transition-colors"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                  </span>
                )}
              </div>
              <SearchDropdown />
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <CartIcon count={cartCount} />
              <ThemeToggle />

              {user ? (
                <div className="flex items-center gap-1 ml-1">
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      Admin
                    </Link>
                  )}
                  {user.role === 'customer' && (
                    <Link
                      to="/conta/pedidos"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                    >
                      Pedidos
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="ml-1 px-4 py-1.5 rounded-lg text-sm font-semibold bg-green-600 dark:bg-[#39ff14] text-white dark:text-black hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>

          {/* Mobile row */}
          <div className="flex md:hidden items-center gap-1 h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1.5 flex-1">
              <PrinterIcon />
              <span className="font-display text-xl text-gray-900 dark:text-gray-100 leading-none">
                LOJA GEEK 3D
              </span>
            </Link>

            {/* Mobile search icon */}
            <button
              onClick={() => setMobileSearchOpen(v => !v)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <SearchIcon />
            </button>

            <CartIcon count={cartCount} />
            <ThemeToggle />

            {/* Hamburger */}
            <button
              onClick={() => setDrawerOpen(v => !v)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <HamburgerIcon open={drawerOpen} />
            </button>
          </div>

          {/* Mobile search expand bar */}
          {mobileSearchOpen && (
            <div ref={mobileSearchRef} className="md:hidden pb-3 relative">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <SearchIcon />
                </span>
                <input
                  ref={mobileInputRef}
                  type="text"
                  value={query}
                  onChange={e => handleSearchChange(e.target.value)}
                  onBlur={() => {
                    // small delay so clicks on results register first
                    setTimeout(() => {
                      if (!dropdownOpen) setMobileSearchOpen(false);
                    }, 150);
                  }}
                  placeholder="Buscar produtos..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg text-sm bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-[#2a2a2a] text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-600 dark:focus:ring-[#39ff14] transition-colors"
                />
              </div>
              <SearchDropdown />
            </div>
          )}
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#0a0a0a]">
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
              <Link
                to="/"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                Home
              </Link>
              <Link
                to="/carrinho"
                onClick={() => setDrawerOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
              >
                Carrinho {cartCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs bg-green-600 dark:bg-[#39ff14] text-white dark:text-black">{cartCount}</span>}
              </Link>

              {user ? (
                <>
                  {user.role === 'admin' && (
                    <Link
                      to="/admin/dashboard"
                      onClick={() => setDrawerOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                    >
                      Painel Admin
                    </Link>
                  )}
                  {user.role === 'customer' && (
                    <Link
                      to="/conta/pedidos"
                      onClick={() => setDrawerOpen(false)}
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                    >
                      Meus Pedidos
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-left text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setDrawerOpen(false)}
                  className="mt-2 w-full px-4 py-2.5 rounded-lg text-sm font-semibold text-center bg-green-600 dark:bg-[#39ff14] text-white dark:text-black hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
                >
                  Entrar
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
      </div>
    </>
  );
}
