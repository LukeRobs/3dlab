import { useState, useEffect } from 'react';

export default function PixPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('pixPopupSeen')) {
      // Small delay so it doesn't flash immediately on page load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  function close() {
    sessionStorage.setItem('pixPopupSeen', '1');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) close(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl bg-[#111] border border-[#2a2a2a]">
        {/* Close button */}
        <button
          onClick={close}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/80 transition-colors"
        >
          ✕
        </button>

        {/* Image / visual area */}
        <div className="relative bg-[#0a0a0a] flex flex-col items-center justify-center py-10 px-6 border-b border-[#2a2a2a]">
          {/* PIX icon large */}
          <div className="w-20 h-20 rounded-2xl bg-[#39ff14]/10 border border-[#39ff14]/30 flex items-center justify-center mb-4">
            <svg viewBox="0 0 512 512" className="w-10 h-10" fill="none">
              <path
                d="M392.3 302.3l-86.4-86.4a5.6 5.6 0 00-7.9 0l-86.4 86.4a5.6 5.6 0 000 7.9l86.4 86.4a5.6 5.6 0 007.9 0l86.4-86.4a5.6 5.6 0 000-7.9z"
                fill="#39ff14"
              />
              <path
                d="M302.3 119.7l-86.4 86.4a5.6 5.6 0 000 7.9l86.4 86.4a5.6 5.6 0 007.9 0l86.4-86.4a5.6 5.6 0 000-7.9l-86.4-86.4a5.6 5.6 0 00-7.9 0z"
                fill="#39ff14"
                opacity="0.5"
              />
            </svg>
          </div>

          <span className="font-display text-5xl text-[#39ff14] tracking-wide leading-none">
            10% OFF
          </span>
          <span className="text-gray-400 text-sm mt-1 font-medium tracking-widest uppercase">
            pagando com pix
          </span>
        </div>

        {/* Content */}
        <div className="px-6 py-5">
          <p className="text-gray-100 text-sm leading-relaxed text-center mb-5">
            Use o <span className="text-[#39ff14] font-semibold">PIX</span> como forma de pagamento
            e ganhe <span className="text-[#39ff14] font-semibold">10% de desconto</span> no
            seu pedido. Informe no WhatsApp ao finalizar sua compra.
          </p>

          <button
            onClick={close}
            className="w-full bg-[#39ff14] text-black font-bold py-3 rounded-xl hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm tracking-wide"
          >
            ENTENDIDO, QUERO APROVEITAR!
          </button>

          <button
            onClick={close}
            className="w-full mt-2 text-gray-500 hover:text-gray-400 text-xs py-2 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
