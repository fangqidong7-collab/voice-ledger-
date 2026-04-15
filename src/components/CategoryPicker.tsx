import { Category } from '../types';
import { cn } from '../lib/utils';

interface CategoryPickerProps {
  categories: Category[];
  selected: Category | null;
  type: 'income' | 'expense';
  onSelect: (category: Category) => void;
}

export function CategoryPicker({ categories, selected, type, onSelect }: CategoryPickerProps) {
  const filteredCategories = categories.filter(
    c => c.type === type || c.type === 'both'
  );

  return (
    <div className="grid grid-cols-5 gap-2">
      {filteredCategories.map((cat) => {
        const isSelected = selected?.id === cat.id;
        
        return (
          <button
            key={cat.id}
            onClick={() => onSelect(cat)}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-xl transition-all',
              isSelected
                ? 'bg-indigo-50 border-2 border-indigo-300 scale-105'
                : 'bg-slate-50 border-2 border-transparent hover:bg-slate-100'
            )}
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className={cn(
              'text-xs truncate w-full text-center',
              isSelected ? 'text-indigo-600 font-medium' : 'text-slate-600'
            )}>
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
