import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Transaction } from '../types';
import { cn } from '../lib/utils';
import { CategoryPicker } from './CategoryPicker';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  categories: Category[];
  currency: '¥' | '$' | '€';
  initialData?: Partial<Transaction>;
  mode?: 'add' | 'edit';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  categories,
  currency,
  initialData,
  mode = 'add',
}: ConfirmModalProps) {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<Category | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setAmount(initialData.amount?.toString() || '');
        setType(initialData.type || 'expense');
        setCategory(categories.find(c => c.name === initialData.category) || null);
        setNote(initialData.note || '');
      } else {
        setAmount('');
        setType('expense');
        setCategory(null);
        setNote('');
      }
    }
  }, [isOpen, initialData, categories]);

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0 || !category) return;
    
    onConfirm({
      amount: numAmount,
      type,
      category: category.name,
      categoryIcon: category.icon,
      note: note || category.name,
      date: new Date().toISOString().slice(0, 10),
    });
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">
            {mode === 'add' ? '确认记账' : '编辑记录'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Amount Input */}
        <div className="mb-5">
          <label className="block text-sm text-slate-500 mb-2">金额</label>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-slate-700">{currency}</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-3xl font-bold font-mono text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none py-1 transition-colors"
            />
          </div>
        </div>

        {/* Type Toggle */}
        <div className="mb-5">
          <label className="block text-sm text-slate-500 mb-2">类型</label>
          <div className="flex gap-2">
            <button
              onClick={() => setType('expense')}
              className={cn(
                'flex-1 py-2.5 rounded-xl font-medium transition-all',
                type === 'expense'
                  ? 'bg-red-50 text-red-600 border-2 border-red-200'
                  : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
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
                  : 'bg-slate-50 text-slate-500 border-2 border-transparent hover:bg-slate-100'
              )}
            >
              收入
            </button>
          </div>
        </div>

        {/* Category Picker */}
        <div className="mb-5">
          <label className="block text-sm text-slate-500 mb-2">分类</label>
          <CategoryPicker
            categories={categories}
            selected={category}
            type={type}
            onSelect={setCategory}
          />
        </div>

        {/* Note Input */}
        <div className="mb-6">
          <label className="block text-sm text-slate-500 mb-2">备注</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注..."
            className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={!amount || !category}
            className={cn(
              'flex-1 py-3.5 rounded-xl font-medium transition-all',
              amount && category
                ? 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            )}
          >
            {mode === 'add' ? '确认' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
