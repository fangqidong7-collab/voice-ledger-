import { useState, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Transaction, Category } from '../types';
import { cn } from '../lib/utils';
import { parseVoiceInput } from '../utils/parser';
import { CategoryPicker } from './CategoryPicker';

interface ManualInputFormProps {
  categories: Category[];
  currency: '¥' | '$' | '€';
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  initialNote?: string;
  initialType?: 'income' | 'expense';
}

export function ManualInputForm({ 
  categories, 
  currency, 
  onSubmit, 
  initialNote = '',
  initialType = 'expense'
}: ManualInputFormProps) {
  const [text, setText] = useState(initialNote);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState(initialNote);
  const [hasParsed, setHasParsed] = useState(false);

  useEffect(() => {
    if (initialNote) {
      setNote(initialNote);
      setText(initialNote);
    }
    if (initialType) {
      setType(initialType);
    }
  }, [initialNote, initialType]);

  const handleParse = () => {
    if (!text.trim()) return;
    
    const result = parseVoiceInput(text, categories);
    setAmount(result.amount.toString());
    setType(result.type);
    const matchedCategory = categories.find(c => c.name === result.category);
    setCategory(matchedCategory || categories.find(c => c.type === result.type) || categories[0]);
    setNote(text);
    setHasParsed(true);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;
    
    if (!category) return;
    
    onSubmit({
      amount: numAmount,
      type,
      category: category.name,
      categoryIcon: category.icon,
      note: note || category.name,
      date: new Date().toISOString().slice(0, 10),
    });
    
    // Reset
    setText('');
    setAmount('');
    setType('expense');
    setCategory(null);
    setNote('');
    setHasParsed(false);
  };

  const canSubmit = amount && parseFloat(amount) > 0 && category;

  return (
    <div className="space-y-4">
      {/* Voice Input Section */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          描述（可选）
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setHasParsed(false);
            }}
            placeholder="如：中午外卖花了30块"
            className="flex-1 px-4 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
          />
          <button
            onClick={handleParse}
            disabled={!text.trim()}
            className={cn(
              'px-4 py-3 rounded-2xl font-medium flex items-center gap-2 transition-all',
              text.trim()
                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200/50 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            )}
          >
            <Sparkles size={18} />
            解析
          </button>
        </div>
        {hasParsed && (
          <p className="text-xs text-emerald-500 mt-1.5 animate-fade-in">
            已自动解析金额和分类，您可以手动调整
          </p>
        )}
      </div>

      {/* Amount Input */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          金额 <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-slate-400">{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 text-3xl font-bold font-mono text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-2 transition-colors placeholder:text-slate-300"
          />
        </div>
      </div>

      {/* Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          类型
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => setType('expense')}
            className={cn(
              'flex-1 py-3 rounded-2xl font-semibold transition-all',
              type === 'expense'
                ? 'bg-gradient-to-r from-red-50 to-rose-50 text-red-600 border-2 border-red-200 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
            )}
          >
            {type === 'expense' && <span className="mr-1">-</span>}
            支出
          </button>
          <button
            onClick={() => setType('income')}
            className={cn(
              'flex-1 py-3 rounded-2xl font-semibold transition-all',
              type === 'income'
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-600 border-2 border-emerald-200 shadow-sm'
                : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
            )}
          >
            {type === 'income' && <span className="mr-1">+</span>}
            收入
          </button>
        </div>
      </div>

      {/* Category Picker */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          分类 <span className="text-red-500">*</span>
        </label>
        <CategoryPicker
          categories={categories}
          selected={category}
          type={type}
          onSelect={setCategory}
        />
      </div>

      {/* Note Input */}
      <div>
        <label className="block text-sm font-medium text-slate-600 mb-2">
          备注
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="添加备注..."
          className="w-full px-4 py-3 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all text-slate-800 placeholder:text-slate-400"
        />
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          'w-full py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all',
          canSubmit
            ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 text-white shadow-lg shadow-indigo-200/50 active:scale-[0.98]'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        )}
      >
        <Send size={18} />
        记一笔
      </button>
    </div>
  );
}
