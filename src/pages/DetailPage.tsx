import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MonthPicker } from '../components/MonthPicker';
import { TransactionItem } from '../components/TransactionItem';
import { ConfirmModal } from '../components/ConfirmModal';
import { Transaction } from '../types';
import { formatCurrency, formatFullDate } from '../utils/formatters';
import { cn } from '../lib/utils';

export function DetailPage() {
  const { 
    state, 
    setMonth, 
    setSearch, 
    updateTransaction, 
    deleteTransaction,
    getFilteredTransactions,
    getMonthStats 
  } = useApp();
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const transactions = getFilteredTransactions();
  const stats = getMonthStats();
  
  // Group transactions by date
  const groupedTransactions = transactions.reduce((groups, t) => {
    const date = t.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(t);
    return groups;
  }, {} as Record<string, Transaction[]>);
  
  // Calculate daily totals
  const dailyTotals = Object.entries(groupedTransactions).map(([date, items]) => {
    const income = items.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = items.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { date, income, expense, count: items.length };
  });
  
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowConfirm(true);
  };
  
  const handleUpdate = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      setEditingTransaction(null);
    }
  };
  
  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setEditingTransaction(null);
    setShowConfirm(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 mb-4">账单明细</h1>
        
        {/* Month Picker */}
        <MonthPicker
          selectedMonth={state.selectedMonth}
          onMonthChange={setMonth}
        />
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={state.searchQuery}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索账单..."
            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all"
          />
          {state.searchQuery && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X size={18} className="text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>
        
        {/* Month Summary */}
        <div className="flex justify-around mt-4 py-2 px-4 bg-slate-50 rounded-xl">
          <div className="text-center">
            <div className="text-xs text-slate-500">支出</div>
            <div className="text-sm font-bold text-red-500 font-mono">
              -{formatCurrency(stats.expense, state.settings.currency)}
            </div>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-xs text-slate-500">收入</div>
            <div className="text-sm font-bold text-emerald-500 font-mono">
              +{formatCurrency(stats.income, state.settings.currency)}
            </div>
          </div>
          <div className="w-px bg-slate-200" />
          <div className="text-center">
            <div className="text-xs text-slate-500">结余</div>
            <div className={cn(
              'text-sm font-bold font-mono',
              stats.balance >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              {formatCurrency(stats.balance, state.settings.currency)}
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions List */}
      <div className="px-4 py-4">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">🔍</span>
            </div>
            <p className="text-slate-500">
              {state.searchQuery ? '没有找到相关账单' : '本月还没有账单'}
            </p>
            <p className="text-sm text-slate-400 mt-1">
              {state.searchQuery ? '试试其他关键词' : '去首页记账吧'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {dailyTotals.map(({ date, income, expense, count }) => (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      {formatFullDate(date)}
                    </span>
                    <span className="text-xs text-slate-400">
                      {count}笔
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs">
                    {expense > 0 && (
                      <span className="text-red-500">-{formatCurrency(expense, state.settings.currency)}</span>
                    )}
                    {income > 0 && (
                      <span className="text-emerald-500">+{formatCurrency(income, state.settings.currency)}</span>
                    )}
                  </div>
                </div>
                
                {/* Transactions */}
                <div className="space-y-2 bg-white rounded-2xl overflow-hidden shadow-sm">
                  {groupedTransactions[date].map((transaction) => (
                    <TransactionItem
                      key={transaction.id}
                      transaction={transaction}
                      currency={state.settings.currency}
                      onEdit={() => handleEdit(transaction)}
                      onDelete={() => handleDelete(transaction.id)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setEditingTransaction(null);
        }}
        onConfirm={handleUpdate}
        categories={state.categories}
        currency={state.settings.currency}
        initialData={editingTransaction || undefined}
        mode="edit"
      />
    </div>
  );
}
