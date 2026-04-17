export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full text-sm border ${!selected ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}`}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.slug)}
          className={`px-3 py-1 rounded-full text-sm border ${selected === cat.slug ? 'bg-indigo-600 text-white border-indigo-600' : 'border-gray-300 hover:border-indigo-400'}`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
