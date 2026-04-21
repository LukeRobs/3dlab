import { Link } from 'react-router-dom';

function CartIconSvg() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 6h13M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" />
    </svg>
  );
}

function PrinterPlaceholder() {
  return (
    <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
    </svg>
  );
}

export default function ProductCard({ product, onAddToCart }) {
  const pixPrice = (parseFloat(product.price) * 0.9).toFixed(2);

  return (
    <div className="group rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:border-green-500 dark:hover:border-[#39ff14]/50 hover:shadow-xl dark:hover:shadow-[0_8px_30px_rgba(57,255,20,0.06)] transition-all duration-300 relative flex flex-col">

      {/* Image area */}
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden aspect-[4/3] flex-shrink-0">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#111] text-gray-300 dark:text-gray-600">
            <PrinterPlaceholder />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <span className="bg-white text-black text-xs font-bold px-5 py-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg tracking-wide">
            VER PRODUTO
          </span>
        </div>
      </Link>

      {/* Category badge */}
      {product.category_name && (
        <span className="absolute top-2 left-2 bg-green-600/90 dark:bg-[#39ff14]/90 text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide backdrop-blur-sm">
          {product.category_name}
        </span>
      )}

      {/* Card body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price block */}
        <div className="mt-2 mb-3">
          <p className="text-green-600 dark:text-[#39ff14] font-bold text-lg leading-none">
            R$ {parseFloat(product.price).toFixed(2)}
          </p>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
            ou <span className="text-green-600 dark:text-[#39ff14] font-semibold">R$ {pixPrice}</span> no PIX
          </p>
        </div>

        {/* Add to Cart button */}
        <button
          onClick={() => onAddToCart(product)}
          aria-label={`Adicionar ${product.name} ao carrinho`}
          className="w-full mt-auto bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold py-2.5 rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm flex items-center justify-center gap-2"
        >
          <CartIconSvg />
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}
