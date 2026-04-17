import { Link } from 'react-router-dom';

export default function ProductCard({ product, onAddToCart }) {
  return (
    <div className="border rounded-lg overflow-hidden shadow hover:shadow-md transition">
      {product.primary_image && (
        <img src={product.primary_image} alt={product.name} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg">{product.name}</h3>
        {product.category_name && (
          <p className="text-sm text-gray-500">{product.category_name}</p>
        )}
        <p className="text-indigo-600 font-bold mt-1">
          R$ {parseFloat(product.price).toFixed(2)}
        </p>
        <div className="mt-3 flex gap-2">
          <Link to={`/produto/${product.slug}`} className="text-sm text-gray-600 hover:underline">
            Ver detalhes
          </Link>
          <button
            onClick={() => onAddToCart(product)}
            className="ml-auto bg-indigo-600 text-white text-sm px-3 py-1 rounded hover:bg-indigo-700"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  );
}
