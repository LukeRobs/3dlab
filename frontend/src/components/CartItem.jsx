function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

export default function CartItem({ item, onQuantityChange, onRemove }) {
  const pixPrice = (parseFloat(item.price || item.unit_price || 0) * 0.9).toFixed(2);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-3 mb-3 transition-colors hover:border-gray-300 dark:hover:border-[#3a3a3a]">
      {/* Product image */}
      {(item.image || item.primary_image) ? (
        <img
          src={item.image || item.primary_image}
          alt={item.name || item.product_name}
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover flex-shrink-0 border border-gray-100 dark:border-[#2a2a2a]"
        />
      ) : (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-gray-100 dark:bg-[#111] flex-shrink-0 flex items-center justify-center">
          <svg className="w-7 h-7 opacity-20 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V3h12v6M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v7H6v-7z" />
          </svg>
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 dark:text-gray-100 line-clamp-2 leading-snug">
          {item.name || item.product_name}
        </p>
        {/* Selected variants */}
        {item.selected_variants && Object.keys(item.selected_variants).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {Object.entries(item.selected_variants).map(([k, v]) => (
              <span key={k} className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-[#2a2a2a] text-gray-500 dark:text-gray-400 font-medium">
                {k}: {v}
              </span>
            ))}
          </div>
        )}
        <p className="text-green-600 dark:text-[#39ff14] font-bold text-sm mt-0.5">
          R$ {parseFloat(item.price || item.unit_price || 0).toFixed(2)}
        </p>
        <p className="text-[11px] text-gray-400 dark:text-gray-500">
          PIX: <span className="text-green-600 dark:text-[#39ff14] font-medium">R$ {pixPrice}</span>
        </p>
      </div>

      {/* Quantity + Remove */}
      <div className="flex flex-col items-end gap-2 flex-shrink-0">
        {/* Quantity controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onQuantityChange(item, item.quantity - 1)}
            aria-label="Diminuir quantidade"
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors font-bold text-base leading-none"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold text-gray-900 dark:text-gray-100">
            {item.quantity}
          </span>
          <button
            onClick={() => onQuantityChange(item, item.quantity + 1)}
            aria-label="Aumentar quantidade"
            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors font-bold text-base leading-none"
          >
            +
          </button>
        </div>

        {/* Remove */}
        <button
          onClick={() => onRemove(item)}
          aria-label={`Remover ${item.name || item.product_name} do carrinho`}
          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
}
