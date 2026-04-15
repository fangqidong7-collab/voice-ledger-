import { useState } from 'react';
import { Send } from 'lucide-react';
import { Transaction, Category } from '../types';
import { cn } from '../lib/utils';
import { parseVoiceInput } from '../utils/parser';
import { CategoryPicker } from './CategoryPicker';

interface ManualInputFormProps {
  categories: Category[];
  currency: '¥' | '$' | '€';
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export function ManualInputForm({ categories, currency, onSubmit }: ManualInputFormProps) {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');

  const handleParse = () => {
    if (!text.trim()) return;
    
    const result = parseVoiceInput(text, categories);
    setAmount(result.amount.toString());
    setType(result.type);
    setCategory(categories.find(c => c.name === result.category) || null);
    setNote(text);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !category) return;
    
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
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="mb-4">
        <label className="block text-sm text-slate-500 mb-2">输入描述</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="如：中午外卖30块"
            className="flex-1 px-4 py-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all"
          />
          <button
            onClick={handleParse}
            className="px-4 py-2.5 bg-indigo-100 text-indigo-600 rounded-xl font-medium hover:bg-indigo-200 transition-colors"
          >
            解析
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-500 mb-2">金额</label>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-slate-700">{currency}</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="flex-1 text-xl font-bold font-mono text-slate-800 bg-slate-50 rounded-xl px-4 py-2.5 border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all"
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-500 mb-2">类型</label>
        <div className="flex gap-2">
          <button
            onClick={() => setType('expense')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all',
              type === 'expense'
                ? 'bg-red-50 text-red-600 border-2 border-red-200'
                : 'bg-slate-50 text-slate-500 border-2 border-transparent'
            )}
          >
            支出
          </button>
          <button
            onClick={() => setType('income')}
            className={cn(
              'flex-1 py-2.5 rounded-xl font-medium transition-all',
              type === 'income'
                ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-2 border-transparent'
            )}
          >
            收入
          </button>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-500 mb-2">分类</label>
        <CategoryPicker
          categories={categories}
          selected={category}
          type={type}
          onSelect={setCategory}
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-slate-500 mb-2">备注</label>
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="添加备注..."
          className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={!amount || !category}
        className={cn(
          'w-full py-3.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all',
          amount && category
            ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-200'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        )}
      >
        <Send size={18} />
        记一笔
      </button>
    </div>
  );
}
