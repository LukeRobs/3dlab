import { useState, useEffect } from 'react';

function CloseIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function PixDiamond() {
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12" fill="none">
      <path d="M50 5L95 50L50 95L5 50Z" fill="#39ff14" fillOpacity="0.15" stroke="#39ff14" strokeWidth="2" />
      <path d="M50 20L80 50L50 80L20 50Z" fill="#39ff14" fillOpacity="0.3" />
      <path d="M50 35L65 50L50 65L35 50Z" fill="#39ff14" />
    </svg>
  );
}

export default function PixPopup() {
  const [visible, setVisible] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('pixPopupSeen')) {
      const t = setTimeout(() => {
        setVisible(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
      }, 800);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    setAnimate(false);
    setTimeout(() => {
      sessionStorage.setItem('pixPopupSeen', '1');
      setVisible(false);
    }, 250);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Desconto PIX"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ${animate ? 'opacity-100' : 'opacity-0'}`}
        onClick={close}
      />

      {/* Card */}
      <div
        className={`relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-[#0f0f0f] border border-[#2a2a2a] transition-all duration-300 ${
          animate ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}
      >
        {/* Close button */}
        <button
          onClick={close}
          aria-label="Fechar popup"
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
        >
          <CloseIcon />
        </button>

        {/* Visual area */}
        <div className="relative bg-gradient-to-b from-[#0a0a0a] to-[#111] flex flex-col items-center justify-center py-10 px-6 border-b border-[#1f1f1f]">
          {/* Glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-40 h-40 rounded-full bg-[#39ff14]/5 blur-3xl" />
          </div>

          {/* Icon */}
          <div className="relative w-20 h-20 rounded-2xl bg-[#39ff14]/10 border border-[#39ff14]/25 flex items-center justify-center mb-5">
            <PixDiamond />
          </div>

          <span className="font-display text-6xl text-[#39ff14] tracking-wide leading-none">
            10% OFF
          </span>
          <span className="text-gray-400 text-xs mt-1.5 font-medium tracking-[0.2em] uppercase">
            pagando com pix
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-gray-300 text-sm leading-relaxed text-center mb-5">
            Use o <span className="text-[#39ff14] font-semibold">PIX</span> como forma de pagamento
            e ganhe <span className="text-[#39ff14] font-semibold">10% de desconto</span> em todo
            pedido. Informe ao atendente no WhatsApp ao finalizar.
          </p>

          <button
            onClick={close}
            className="w-full bg-[#39ff14] text-black font-bold py-3.5 rounded-xl hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm tracking-wide uppercase"
          >
            Quero aproveitar!
          </button>

          <button
            onClick={close}
            className="w-full mt-2.5 text-gray-500 hover:text-gray-400 text-xs py-2 transition-colors"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}
