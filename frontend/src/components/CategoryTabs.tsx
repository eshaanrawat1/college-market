type CategoryKey = 'all' | 'uc' | 'ivy' | 'csu' | 'international';

interface CategoryTabsProps {
  activeCategory: CategoryKey;
  onChange: (key: CategoryKey) => void;
}

const categories: { key: CategoryKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'uc', label: 'UC' },
  { key: 'ivy', label: 'Ivy' },
  { key: 'csu', label: 'CSU' },
  { key: 'international', label: 'International' },
];

const CategoryTabs = ({ activeCategory, onChange }: CategoryTabsProps) => {
  return (
    <div className="mt-3 border-b border-slate-700">
      <div className="flex gap-6 overflow-x-auto">
        {categories.map((c) => (
          <button
            key={c.key}
            onClick={() => onChange(c.key)}
            className={`pb-2 text-md font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeCategory === c.key
                ? 'border-blue-500 text-blue-300'
                : 'border-transparent text-gray-500 hover:text-gray-200 hover:border-slate-500'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;