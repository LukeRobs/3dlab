import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

function ChevronLeft() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
}

const INTERVAL = 5000;

export default function HeroCarousel() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef(null);
  const progressRef = useRef(null);
  const progressStartRef = useRef(null);

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

  // Progress animation
  const startProgress = useCallback(() => {
    if (progressRef.current) cancelAnimationFrame(progressRef.current);
    progressStartRef.current = performance.now();
    setProgress(0);
    function tick(now) {
      const elapsed = now - progressStartRef.current;
      const pct = Math.min((elapsed / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        progressRef.current = requestAnimationFrame(tick);
      }
    }
    progressRef.current = requestAnimationFrame(tick);
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % Math.max(slides.length, 1));
    }, INTERVAL);
    startProgress();
  }, [slides.length, startProgress]);

  useEffect(() => {
    if (!paused && slides.length > 1) {
      startInterval();
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) cancelAnimationFrame(progressRef.current);
      if (paused) setProgress(0);
    }
    return () => {
      clearInterval(intervalRef.current);
      cancelAnimationFrame(progressRef.current);
    };
  }, [paused, slides.length, startInterval]);

  function goTo(idx) {
    setCurrent(idx);
    if (!paused && slides.length > 1) startInterval();
  }

  function prev() {
    goTo((current - 1 + slides.length) % slides.length);
  }

  function next() {
    goTo((current + 1) % slides.length);
  }

  if (loading) {
    return (
      <div className="w-full bg-gray-100 dark:bg-[#111111] animate-pulse" style={{ height: 'clamp(280px, 40vw, 500px)' }} />
    );
  }

  if (slides.length === 0) {
    return (
      <div className="w-full flex items-center justify-center bg-gray-100 dark:bg-[#111111]" style={{ height: 'clamp(280px, 40vw, 500px)' }}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
          </svg>
          <p className="font-display text-2xl text-gray-400 dark:text-gray-600">LOJA GEEK 3D</p>
          <p className="text-gray-400 dark:text-gray-500 mt-1 text-sm">Adicione produtos no painel admin</p>
        </div>
      </div>
    );
  }

  const slide = slides[current];

  return (
    <div
      className="relative w-full overflow-hidden bg-gray-900"
      style={{ height: 'clamp(320px, 45vw, 560px)' }}
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
          {s.primary_image ? (
            <img
              src={s.primary_image}
              alt={s.name}
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900" />
          )}

          {/* Gradient overlay — suave, só para legibilidade do texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 z-10">
            <div className="max-w-7xl mx-auto w-full">
              {/* Category badge */}
              {s.category_name && (
                <span className="inline-block mb-3 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-600 dark:bg-[#39ff14] text-white dark:text-black">
                  {s.category_name}
                </span>
              )}

              {/* Product name */}
              <h2
                className="font-display text-white leading-none mb-2 drop-shadow-lg"
                style={{ fontSize: 'clamp(1.75rem, 5vw, 3.5rem)' }}
              >
                {s.name}
              </h2>

              {/* Price */}
              <p className="text-[#39ff14] font-bold mb-5 drop-shadow" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.75rem)' }}>
                {formatPrice(s.price)}
              </p>

              {/* CTA */}
              <Link
                to={`/produto/${s.slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm bg-green-600 dark:bg-[#39ff14] text-white dark:text-black hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all shadow-lg"
              >
                Ver Produto
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {/* Prev / Next arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 border border-white/10 hover:bg-black/70 hover:border-white/30 text-white transition-all backdrop-blur-sm"
            aria-label="Slide anterior"
          >
            <ChevronLeft />
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center rounded-full bg-black/40 border border-white/10 hover:bg-black/70 hover:border-white/30 text-white transition-all backdrop-blur-sm"
            aria-label="Próximo slide"
          >
            <ChevronRight />
          </button>
        </>
      )}

      {/* Bottom controls: dots + progress */}
      {slides.length > 1 && (
        <div className="absolute bottom-0 left-0 right-0 z-20">
          {/* Progress bar */}
          {!paused && (
            <div className="h-[2px] bg-white/10">
              <div
                className="h-full bg-[#39ff14] transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 py-3">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ir para slide ${i + 1}`}
                className={`rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 h-2 bg-[#39ff14]'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
