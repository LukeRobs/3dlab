import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-[#0a0a0a] border-t-2 border-green-600 dark:border-[#39ff14] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <h3 className="font-display text-2xl text-white mb-2">LOJA GEEK 3D</h3>
          <p className="text-gray-400 text-sm">Impressão 3D de qualidade para colecionadores e entusiastas.</p>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-gray-400 text-xs uppercase tracking-wide font-semibold mb-1">Links</p>
          <Link to="/" className="text-gray-300 hover:text-[#39ff14] text-sm transition-colors">Home</Link>
          <Link to="/" className="text-gray-300 hover:text-[#39ff14] text-sm transition-colors">Catálogo</Link>
          <Link to="/carrinho" className="text-gray-300 hover:text-[#39ff14] text-sm transition-colors">Carrinho</Link>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-gray-500 text-xs">
        Feito com 💚 — Loja Geek 3D
      </div>
    </footer>
  );
}
