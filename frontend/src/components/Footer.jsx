import { Link } from 'react-router-dom';

function CreditCardIcon() {
  return (
    <svg className="w-6 h-6 text-green-500 dark:text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg className="w-6 h-6 text-green-500 dark:text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8M12 17v4M7 4H4a1 1 0 00-1 1v3a4 4 0 004 4h1M17 4h3a1 1 0 011 1v3a4 4 0 01-4 4h-1M7 4h10v5a5 5 0 01-10 0V4z" />
    </svg>
  );
}

function StoreIcon() {
  return (
    <svg className="w-6 h-6 text-green-500 dark:text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function PixIcon() {
  return (
    <svg viewBox="0 0 512 512" className="w-5 h-5" fill="none">
      <path d="M256 60l-88 88 88 88 88-88L256 60z" fill="#39ff14" />
      <path d="M148 168l-88 88 88 88 88-88-88-88z" fill="#39ff14" opacity="0.6" />
      <path d="M364 168l-88 88 88 88 88-88-88-88z" fill="#39ff14" opacity="0.6" />
      <path d="M256 276l-88 88 88 88 88-88-88-88z" fill="#39ff14" opacity="0.4" />
    </svg>
  );
}

const BENEFITS = [
  { Icon: CreditCardIcon, text: 'Pagamento em até', highlight: '12X sem juros' },
  { Icon: TrophyIcon, text: 'Mais de 20 mil', highlight: 'Itens Colecionáveis' },
  { Icon: StoreIcon, text: 'Compre online e', highlight: 'Retire na Loja Física' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-[#0a0a0a] border-t-2 border-green-600 dark:border-[#39ff14] mt-auto">

      {/* Benefits strip */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {BENEFITS.map(({ Icon, text, highlight }) => (
            <div key={highlight} className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon />
              </div>
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide">{text}</p>
                <p className="text-white text-sm font-bold uppercase tracking-wide">{highlight}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-6 h-6 text-green-500 dark:text-[#39ff14]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
            </svg>
            <h3 className="font-display text-2xl text-white leading-none">LOJA GEEK 3D</h3>
          </div>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed">
            Impressão 3D de qualidade para colecionadores e entusiastas. Miniaturas, personagens e
            acessórios exclusivos feitos sob encomenda.
          </p>
          <div className="mt-4 flex items-center gap-2 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-lg px-4 py-2.5 w-fit">
            <PixIcon />
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
        Feito com cuidado — Loja Geek 3D
      </div>
    </footer>
  );
}
