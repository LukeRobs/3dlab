export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <div className="flex items-center gap-4 bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-[#2a2a2a] p-4 mb-3">
      {(item.image || item.primary_image) && (
        <img
          src={item.image || item.primary_image}
          alt={item.name || item.product_name}
          className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{item.name || item.product_name}</p>
        <p className="text-green-600 dark:text-[#39ff14] font-bold">
          R$ {parseFloat(item.price || item.unit_price || 0).toFixed(2)}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onQuantityChange(item, item.quantity - 1)}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-gray-100">{item.quantity}</span>
        <button
          onClick={() => onQuantityChange(item, item.quantity + 1)}
          className="w-8 h-8 rounded-lg border border-gray-200 dark:border-[#2a2a2a] flex items-center justify-center hover:bg-gray-50 dark:hover:bg-[#222] text-gray-700 dark:text-gray-300 transition-colors"
        >
          +
        </button>
      </div>
      <button
        onClick={() => onRemove(item)}
        className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
        title="Remover"
      >
        🗑️
      </button>
    </div>
  );
}
