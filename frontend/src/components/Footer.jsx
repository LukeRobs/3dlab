import { Link } from 'react-router-dom';

const BENEFITS = [
  { icon: '💳', text: 'Pagamento em até', highlight: '12X' },
  { icon: '🏆', text: 'Mais de 20 mil', highlight: 'Itens Colecionáveis' },
  { icon: '🏪', text: 'Compre online e', highlight: 'Retire na Loja Física' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-[#0a0a0a] border-t-2 border-green-600 dark:border-[#39ff14] mt-auto">
      {/* Benefits strip */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BENEFITS.map(b => (
            <div key={b.highlight} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-xl flex-shrink-0">
                {b.icon}
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">{b.text}</p>
                <p className="text-white text-sm font-bold uppercase tracking-wide">{b.highlight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="sm:col-span-2">
          <h3 className="font-display text-2xl text-white mb-2">LOJA GEEK 3D</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Impressão 3D de qualidade para colecionadores e entusiastas. Miniaturas, personagens e
            acessórios exclusivos feitos sob encomenda.
          </p>
          <div className="mt-4 flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-lg px-4 py-2.5 w-fit">
            <span className="text-[#39ff14] text-base">💸</span>
            <span className="text-[#39ff14] text-sm font-semibold">10% de desconto pagando com PIX</span>
          </div>
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
