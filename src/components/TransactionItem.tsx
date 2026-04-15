import { useState, useRef } from 'react';
import { Trash2, Edit3 } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatTime } from '../utils/formatters';
import { cn } from '../lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  currency: '¥' | '$' | '€';
  onEdit: () => void;
  onDelete: () => void;
}

export function TransactionItem({ transaction, currency, onEdit, onDelete }: TransactionItemProps) {
  const [isSwiped, setIsSwiped] = useState(false);
  const [startX, setStartX] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  
  const isExpense = transaction.type === 'expense';
  
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].clientX);
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    if (diff > 0 && diff < 100) {
      setIsSwiped(true);
    } else if (diff <= 0) {
      setIsSwiped(false);
    }
  };
  
  const handleTouchEnd = () => {
    if (!isSwiped) {
      setIsSwiped(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Delete button behind */}
      <div className="absolute right-0 top-0 bottom-0 flex items-center justify-end pr-3">
        <button
          onClick={() => {
            onDelete();
            setIsSwiped(false);
          }}
          className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center shadow-lg"
        >
          <Trash2 size={20} className="text-white" />
        </button>
      </div>
      
      {/* Item content */}
      <div
        ref={itemRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={() => isSwiped && setIsSwiped(false)}
        className={cn(
          'relative flex items-center gap-3 p-4 bg-white transition-all duration-200 active:bg-slate-50',
          isSwiped && '-translate-x-20'
        )}
      >
        {/* Category Icon */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl shadow-sm">
          {transaction.categoryIcon}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 truncate">
              {transaction.note || transaction.category}
            </span>
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded font-medium',
              isExpense 
                ? 'bg-red-50 text-red-500' 
                : 'bg-emerald-50 text-emerald-500'
            )}>
              {isExpense ? '支出' : '收入'}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {transaction.category}
          </div>
        </div>
        
        {/* Amount & Time */}
        <div className="text-right">
          <div className={cn(
            'font-bold font-mono text-base',
            isExpense ? 'text-red-500' : 'text-emerald-500'
          )}>
            {isExpense ? '-' : '+'}{formatCurrency(transaction.amount, currency)}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            {formatTime(transaction.createdAt)}
          </div>
        </div>
        
        {/* Edit button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-90"
        >
          <Edit3 size={15} className="text-slate-500" />
        </button>
      </div>
    </div>
  );
}
