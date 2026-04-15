import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { VoiceButton } from '../components/VoiceButton';
import { StatCard } from '../components/StatCard';
import { TransactionItem } from '../components/TransactionItem';
import { ConfirmModal } from '../components/ConfirmModal';
import { ManualInputForm } from '../components/ManualInputForm';
import { Transaction } from '../types';
import { CalendarDays } from 'lucide-react';

export function HomePage() {
  const { state, addTransaction, updateTransaction, deleteTransaction, getMonthStats, setPage } = useApp();
  const { state: voiceState, transcript, startRecording, stopRecording, parseResult, reset } = useSpeechRecognition();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pendingData, setPendingData] = useState<Omit<Transaction, 'id' | 'createdAt'> | null>(null);
  
  const stats = getMonthStats();
  const today = new Date().toISOString().slice(0, 10);
  const todayTransactions = state.transactions.filter(t => t.date === today);
  
  const handleVoiceResult = () => {
    if (voiceState === 'processing' && transcript) {
      const parsed = parseResult(state.categories);
      if (parsed && parsed.amount > 0) {
        setPendingData({
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category,
          categoryIcon: parsed.categoryIcon,
          note: parsed.note,
          date: today,
        });
        setShowConfirm(true);
      }
    }
  };
  
  useEffect(() => {
    handleVoiceResult();
  }, [voiceState, transcript]);
  
  const handleConfirm = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    addTransaction(data);
    reset();
    setPendingData(null);
  };
  
  const handleCloseConfirm = () => {
    setShowConfirm(false);
    setPendingData(null);
    reset();
  };
  
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
      <div className="bg-gradient-to-br from-indigo-500 to-violet-500 px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">小声记账</h1>
          <div className="flex items-center gap-1.5 text-white/80 text-sm">
            <CalendarDays size={16} />
            <span>{new Date().getMonth() + 1}月{new Date().getDate()}日</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="flex gap-2 -mb-8">
          <StatCard
            type="expense"
            label="本月支出"
            amount={stats.expense}
            currency={state.settings.currency}
            onClick={() => setPage('stats')}
          />
          <StatCard
            type="income"
            label="本月收入"
            amount={stats.income}
            currency={state.settings.currency}
            onClick={() => setPage('stats')}
          />
          <StatCard
            type="balance"
            label="本月结余"
            amount={stats.balance}
            currency={state.settings.currency}
            onClick={() => setPage('stats')}
          />
        </div>
      </div>
      
      {/* Spacer for stats cards */}
      <div className="h-20" />
      
      {/* Voice Button Section */}
      <div className="flex flex-col items-center py-8 px-4">
        {voiceState === 'unsupported' ? (
          <div className="w-full max-w-sm">
            <ManualInputForm
              categories={state.categories}
              currency={state.settings.currency}
              onSubmit={addTransaction}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <VoiceButton
              state={voiceState}
              onStart={startRecording}
              onStop={stopRecording}
            />
            
            {/* Transcript Preview */}
            {transcript && voiceState !== 'idle' && (
              <div className="mt-6 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-xs">
                <p className="text-sm text-slate-600 text-center">
                  "{transcript}"
                </p>
              </div>
            )}
            
            {/* Manual Input Toggle */}
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-6 text-sm text-indigo-500 hover:text-indigo-600"
            >
              手动输入
            </button>
          </div>
        )}
      </div>
      
      {/* Today's Transactions */}
      <div className="px-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-800">今日账单</h2>
          <button 
            onClick={() => setPage('detail')}
            className="text-sm text-indigo-500 hover:text-indigo-600"
          >
            查看全部
          </button>
        </div>
        
        {todayTransactions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-slate-500">今天还没有记账哦~</p>
            <p className="text-sm text-slate-400 mt-1">点击上方按钮开始记账</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTransactions.slice(0, 5).map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                currency={state.settings.currency}
                onEdit={() => handleEdit(transaction)}
                onDelete={() => handleDelete(transaction.id)}
              />
            ))}
            {todayTransactions.length > 5 && (
              <button
                onClick={() => setPage('detail')}
                className="w-full py-3 text-center text-sm text-slate-500 hover:text-indigo-500"
              >
                还有 {todayTransactions.length - 5} 条记录...
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={handleCloseConfirm}
        onConfirm={editingTransaction ? handleUpdate : handleConfirm}
        categories={state.categories}
        currency={state.settings.currency}
        initialData={editingTransaction || pendingData || undefined}
        mode={editingTransaction ? 'edit' : 'add'}
      />
    </div>
  );
}
