export default function CartItem({ item, onQuantityChange, onRemove }) {
  return (
    <div className="flex items-center gap-4 py-4 border-b">
      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
      <div className="flex-1">
        <p className="font-medium">{item.name || item.product_name}</p>
        <p className="text-indigo-600">R$ {parseFloat(item.price || item.unit_price || 0).toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onQuantityChange(item, item.quantity - 1)} className="px-2 py-1 border rounded">-</button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button onClick={() => onQuantityChange(item, item.quantity + 1)} className="px-2 py-1 border rounded">+</button>
      </div>
      <button onClick={() => onRemove(item)} className="text-red-500 hover:text-red-700 text-sm">Remover</button>
    </div>
  );
}
