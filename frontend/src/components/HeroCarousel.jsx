import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

function ChevronLeft() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  // Fetch top 5 products by views_count
  useEffect(() => {
    api.get('/produtos')
      .then(({ data }) => {
        const sorted = [...data]
          .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
          .slice(0, 5);
        setSlides(sorted);
      })
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }, []);

  // Auto-play
  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % Math.max(slides.length, 1));
    }, 5000);
  }, [slides.length]);

  useEffect(() => {
    if (!paused && slides.length > 1) {
      startInterval();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [paused, slides.length, startInterval]);

  function prev() {
    setCurrent(c => (c - 1 + slides.length) % slides.length);
  }

  function next() {
    setCurrent(c => (c + 1) % slides.length);
  }

  if (loading) {
    return (
      <div className="w-full h-[500px] md:h-[400px] sm:h-[280px] bg-gray-100 dark:bg-[#111111] animate-pulse" />
    );
  }

  // Empty state
  if (slides.length === 0) {
    return (
      <div className="w-full h-[500px] md:h-[400px] bg-gray-100 dark:bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl text-gray-400 dark:text-gray-600">LOJA GEEK 3D</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2 text-sm">Adicione produtos no painel admin</p>
        </div>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden bg-black"
      style={{ height: 'clamp(280px, 40vw, 500px)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {/* Background image */}
          {s.primary_image ? (
            <img
              src={s.primary_image}
              alt={s.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10">
            <div className="max-w-7xl mx-auto">
              {/* Category badge */}
              {s.category_name && (
                <span className="inline-block mb-3 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-600 dark:bg-[#39ff14] text-white dark:text-black">
                  {s.category_name}
                </span>
              )}

              {/* Product name */}
              <h2 className="font-display text-5xl md:text-4xl text-white leading-none mb-2 drop-shadow-lg"
                  style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}>
                {s.name}
              </h2>

              {/* Price */}
              <p className="text-[#39ff14] text-2xl font-bold mb-4 drop-shadow">
                {formatPrice(s.price)}
              </p>

              {/* CTA */}
              <Link
                to={`/produto/${s.slug}`}
                className="inline-block px-6 py-3 rounded-lg font-semibold text-sm bg-green-600 dark:bg-[#39ff14] text-white dark:text-black hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all"
              >
                Ver Produto
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows — hidden on mobile */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
            aria-label="Anterior"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 hover:bg-black/70 text-white transition-colors"
            aria-label="Próximo"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Slide ${i + 1}`}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-6 h-2 bg-[#39ff14]'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
