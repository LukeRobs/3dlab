export default function CategoryFilter({ categories, selected, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-6 pb-1">
      <button
        onClick={() => onChange(null)}
        className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
          !selected
            ? 'bg-green-600 dark:bg-[#39ff14] text-white dark:text-black border-transparent'
            : 'border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-green-500'
        }`}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          onClick={() => onChange(cat.slug)}
          className={`flex-shrink-0 rounded-full px-4 py-1.5 text-sm font-medium border transition-colors ${
            selected === cat.slug
              ? 'bg-green-600 dark:bg-[#39ff14] text-white dark:text-black border-transparent'
              : 'border-gray-300 dark:border-[#2a2a2a] text-gray-600 dark:text-gray-400 hover:border-green-500'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
