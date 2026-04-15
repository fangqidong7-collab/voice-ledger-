import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { cn } from '../lib/utils';
import { formatCurrency } from '../utils/formatters';

interface StatCardProps {
  type: 'expense' | 'income' | 'balance';
  label: string;
  amount: number;
  currency: '¥' | '$' | '€';
  onClick?: () => void;
}

const configs = {
  expense: {
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-100',
  },
  income: {
    icon: TrendingUp,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-100',
  },
  balance: {
    icon: Wallet,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-100',
  },
};

export function StatCard({ type, label, amount, currency, onClick }: StatCardProps) {
  const config = configs[type];
  const Icon = config.icon;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 p-3 rounded-2xl border transition-all duration-200',
        'hover:shadow-md active:scale-98',
        config.bgColor,
        config.borderColor
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={14} className={config.color} />
        <span className="text-xs text-slate-500 font-medium">{label}</span>
      </div>
      <div className={cn('text-lg font-bold font-mono tracking-tight', config.color)}>
        {type === 'balance' && amount < 0 ? '-' : ''}
        {formatCurrency(Math.abs(amount), currency)}
      </div>
    </button>
  );
}
