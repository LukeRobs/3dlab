import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="group rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:border-green-500 dark:hover:border-[#39ff14]/50 hover:shadow-lg dark:hover:shadow-[#39ff14]/5 transition-all duration-200 relative">
      {/* Image area */}
      <Link to={`/produto/${product.slug}`} className="block relative overflow-hidden aspect-[4/3]">
        {product.primary_image ? (
          <img
            src={product.primary_image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-[#111] text-gray-300 dark:text-gray-600 text-4xl">
            🖨️
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <span className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
            Ver Produto
          </span>
        </div>
      </Link>

      {/* Category badge */}
      {product.category_name && (
        <span className="absolute top-2 left-2 bg-green-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
          {product.category_name}
        </span>
      )}

      {/* Card body */}
      <div className="p-4">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>
        <p className="text-green-600 dark:text-[#39ff14] font-bold text-lg mt-1 leading-none">
          R$ {parseFloat(product.price).toFixed(2)}
        </p>
        <button
          onClick={() => onAddToCart(product)}
          className="w-full mt-3 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold py-2.5 rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm"
        >
          Adicionar ao Carrinho
        </button>
      </div>
    </div>
  );
}
