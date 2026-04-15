import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { VoiceButton } from '../components/VoiceButton';
import { StatCard } from '../components/StatCard';
import { TransactionItem } from '../components/TransactionItem';
import { ConfirmModal } from '../components/ConfirmModal';
import { ManualInputForm } from '../components/ManualInputForm';
import { Transaction } from '../types';
import { CalendarDays, AlertCircle } from 'lucide-react';

export function HomePage() {
  const { state, addTransaction, updateTransaction, deleteTransaction, getMonthStats, setPage } = useApp();
  const { state: voiceState, transcript, startRecording, stopRecording, parseResult, reset, getErrorMessage } = useSpeechRecognition();
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [pendingData, setPendingData] = useState<Omit<Transaction, 'id' | 'createdAt'> | null>(null);
  const [storageWarning, setStorageWarning] = useState<string | null>(null);
  
  const stats = getMonthStats();
  const today = new Date().toISOString().slice(0, 10);
  const todayTransactions = state.transactions.filter(t => t.date === today);
  
  // 处理语音识别结果
  useEffect(() => {
    if (voiceState === 'processing' && transcript) {
      const parsed = parseResult(state.categories);
      
      if (parsed && parsed.amount > 0) {
        // 成功解析出金额
        setPendingData({
          amount: parsed.amount,
          type: parsed.type,
          category: parsed.category,
          categoryIcon: parsed.categoryIcon,
          note: parsed.note,
          date: today,
        });
        setShowConfirm(true);
      } else {
        // 无法解析金额，显示手动输入表单
        setPendingData({
          amount: 0,
          type: parsed?.type || 'expense',
          category: parsed?.category || state.categories[0]?.name || '其他',
          categoryIcon: parsed?.categoryIcon || state.categories[0]?.icon || '📦',
          note: transcript,
          date: today,
        });
        setShowManualInput(true);
      }
    }
  }, [voiceState, transcript]);
  
  // 监听权限拒绝状态
  useEffect(() => {
    if (voiceState === 'permission_denied' || voiceState === 'unsupported') {
      setShowManualInput(true);
    }
  }, [voiceState]);
  
  const handleConfirm = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      addTransaction(data);
      reset();
      setPendingData(null);
    } catch (err) {
      if (err instanceof Error && err.message.includes('存储空间')) {
        setStorageWarning(err.message);
      }
    }
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
      try {
        updateTransaction(editingTransaction.id, data);
        setEditingTransaction(null);
      } catch (err) {
        if (err instanceof Error && err.message.includes('存储空间')) {
          setStorageWarning(err.message);
        }
      }
    }
  };
  
  const handleDelete = (id: string) => {
    try {
      deleteTransaction(id);
      setEditingTransaction(null);
      setShowConfirm(false);
    } catch (err) {
      if (err instanceof Error && err.message.includes('存储空间')) {
        setStorageWarning(err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-500 px-4 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">小声记账</h1>
          <div className="flex items-center gap-1.5 text-white/80 text-sm bg-white/10 px-3 py-1.5 rounded-full">
            <CalendarDays size={14} />
            <span>{new Date().getMonth() + 1}月{new Date().getDate()}日</span>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
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
      
      {/* Storage Warning */}
      {storageWarning && (
        <div className="mx-4 -mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-700">{storageWarning}</p>
            <button 
              onClick={() => {
                setStorageWarning(null);
                setPage('settings');
              }}
              className="text-xs text-amber-600 underline mt-1"
            >
              前往设置导出数据
            </button>
          </div>
          <button 
            onClick={() => setStorageWarning(null)}
            className="text-amber-400 hover:text-amber-600"
          >
            ✕
          </button>
        </div>
      )}
      
      {/* Voice Section */}
      <div className="px-4 py-6">
        {!showManualInput ? (
          <div className="bg-white rounded-3xl shadow-card p-4">
            {/* Error Message */}
            {(voiceState === 'error' || voiceState === 'permission_denied') && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{getErrorMessage()}</p>
              </div>
            )}
            
            {/* Voice Button */}
            <div className="flex justify-center">
              <VoiceButton
                state={voiceState}
                onStart={startRecording}
                onStop={stopRecording}
              />
            </div>
            
            {/* Transcript Preview */}
            {transcript && voiceState !== 'idle' && (
              <div className="mt-4 px-4 py-3 bg-slate-50 rounded-2xl animate-fade-in">
                <p className="text-sm text-slate-600 text-center">
                  "{transcript}"
                </p>
              </div>
            )}
            
            {/* Manual Input Toggle */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowManualInput(true)}
                className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
              >
                使用手动输入
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-card p-4 animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">手动记账</h3>
              <button
                onClick={() => {
                  setShowManualInput(false);
                  reset();
                }}
                className="text-sm text-indigo-500 hover:text-indigo-600"
              >
                返回语音
              </button>
            </div>
            <ManualInputForm
              categories={state.categories}
              currency={state.settings.currency}
              onSubmit={addTransaction}
            />
          </div>
        )}
      </div>
      
      {/* Today's Transactions */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">今日账单</h2>
          <button 
            onClick={() => setPage('detail')}
            className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
          >
            查看全部
          </button>
        </div>
        
        {todayTransactions.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-card p-8 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-full flex items-center justify-center mb-4 animate-float">
              <span className="text-4xl">📝</span>
            </div>
            <p className="text-slate-600 font-medium">今天还没有记账哦~</p>
            <p className="text-sm text-slate-400 mt-1">点击上方按钮开始记账</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTransactions.slice(0, 5).map((transaction, index) => (
              <div 
                key={transaction.id} 
                className="animate-list-item"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <TransactionItem
                  transaction={transaction}
                  currency={state.settings.currency}
                  onEdit={() => handleEdit(transaction)}
                  onDelete={() => handleDelete(transaction.id)}
                />
              </div>
            ))}
            {todayTransactions.length > 5 && (
              <button
                onClick={() => setPage('detail')}
                className="w-full py-4 text-center text-sm text-slate-500 hover:text-indigo-500 transition-colors"
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
