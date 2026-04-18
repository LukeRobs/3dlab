import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="rounded-xl overflow-hidden bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] hover:scale-[1.02] transition-transform duration-200 relative">
      <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-[#111]">
        {product.primary_image ? (
          <img src={product.primary_image} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600 text-4xl">🖨️</div>
        )}
      </div>
      {product.category_name && (
        <span className="absolute top-2 left-2 bg-green-600/90 text-white text-xs px-2 py-0.5 rounded-full">
          {product.category_name}
        </span>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-base text-gray-900 dark:text-gray-100">{product.name}</h3>
        <p className="text-green-600 dark:text-[#39ff14] font-bold text-lg mt-1">
          R$ {parseFloat(product.price).toFixed(2)}
        </p>
        <div className="flex gap-2 mt-3">
          <Link
            to={`/produto/${product.slug}`}
            className="flex-1 text-center text-sm border border-gray-200 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222] transition-colors"
          >
            Ver
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            className="flex-1 bg-green-600 dark:bg-[#39ff14] text-white dark:text-black font-semibold py-2 rounded-lg hover:bg-green-700 dark:hover:bg-[#2bcc0f] active:scale-95 transition-all text-sm"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
