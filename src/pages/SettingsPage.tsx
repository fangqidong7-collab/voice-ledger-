import { useState } from 'react';
import { 
  Settings, Download, Trash2, ChevronRight, Plus, X, Check 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Category } from '../types';
import { exportToCSV } from '../utils/storage';
import { cn } from '../lib/utils';

const CURRENCIES = [
  { value: '¥' as const, label: '人民币 (¥)', symbol: '¥' },
  { value: '$' as const, label: '美元 ($)', symbol: '$' },
  { value: '€' as const, label: '欧元 (€)', symbol: '€' },
];

const EMOJI_OPTIONS = ['🍔', '🚗', '🛒', '🏠', '🎮', '💊', '📚', '💰', '🔄', '📦', '🎁', '✈️', '🎯', '💄', '🎵', '🏋️'];

export function SettingsPage() {
  const { state, addCategory, updateCategory, deleteCategory, setCurrency, clearAllData } = useApp();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryType, setNewCategoryType] = useState<'expense' | 'income' | 'both'>('expense');

  const handleExport = () => {
    const csv = exportToCSV(state.transactions);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `voicebook_export_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    addCategory({
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      keywords: [],
      type: newCategoryType,
    });
    setNewCategoryName('');
    setNewCategoryIcon('📦');
    setNewCategoryType('expense');
    setShowAddCategory(false);
  };

  const handleUpdateCategory = () => {
    if (!editingCategory || !newCategoryName.trim()) return;
    updateCategory(editingCategory.id, {
      name: newCategoryName.trim(),
      icon: newCategoryIcon,
      type: newCategoryType,
    });
    setEditingCategory(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-500 to-violet-500 px-4 pt-12 pb-6">
        <h1 className="text-2xl font-bold text-white">设置</h1>
        <p className="text-white/70 text-sm mt-1">管理你的记账偏好</p>
      </div>

      <div className="px-4 py-4 space-y-4 -mt-4">
        {/* Category Management */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-list-item" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <Settings size={18} className="text-indigo-500" />
            </div>
            <span className="font-semibold text-slate-800">分类管理</span>
          </div>
          
          {state.categories.map((category) => (
            <div 
              key={category.id}
              className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 last:border-b-0 hover:bg-slate-50 transition-colors cursor-pointer active:bg-slate-100"
              onClick={() => {
                setEditingCategory(category);
                setNewCategoryName(category.name);
                setNewCategoryIcon(category.icon);
                setNewCategoryType(category.type);
              }}
            >
              <div className="flex-1 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                  {category.icon}
                </div>
                <span className="font-medium text-slate-700">{category.name}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium',
                  category.type === 'expense' ? 'bg-red-50 text-red-500' :
                  category.type === 'income' ? 'bg-emerald-50 text-emerald-500' :
                  'bg-slate-100 text-slate-500'
                )}>
                  {category.type === 'expense' ? '支出' : category.type === 'income' ? '收入' : '通用'}
                </span>
              </div>
              <ChevronRight size={18} className="text-slate-400" />
            </div>
          ))}
          
          <button
            onClick={() => {
              setShowAddCategory(true);
              setNewCategoryName('');
              setNewCategoryIcon('📦');
              setNewCategoryType('expense');
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-indigo-500 hover:bg-indigo-50 transition-colors"
          >
            <Plus size={18} />
            <span className="font-medium">添加分类</span>
          </button>
        </div>

        {/* Currency Settings */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-list-item" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <span className="text-lg font-bold text-emerald-600">{state.settings.currency}</span>
            </div>
            <span className="font-semibold text-slate-800">货币单位</span>
          </div>
          <div className="p-2">
            {CURRENCIES.map((currency) => (
              <button
                key={currency.value}
                onClick={() => setCurrency(currency.value)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all',
                  state.settings.currency === currency.value
                    ? 'bg-gradient-to-r from-indigo-50 to-violet-50 border-2 border-indigo-200'
                    : 'hover:bg-slate-50 border-2 border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn(
                    'text-xl font-bold',
                    state.settings.currency === currency.value ? 'text-indigo-600' : 'text-slate-400'
                  )}>
                    {currency.symbol}
                  </span>
                  <span className={cn(
                    'font-medium',
                    state.settings.currency === currency.value ? 'text-indigo-700' : 'text-slate-600'
                  )}>
                    {currency.label.split(' (')[0]}
                  </span>
                </div>
                {state.settings.currency === currency.value && (
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-card animate-list-item" style={{ animationDelay: '200ms' }}>
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors active:bg-slate-100"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
              <Download size={18} className="text-blue-500" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-semibold text-slate-800">导出数据</span>
              <p className="text-xs text-slate-400 mt-0.5">{state.transactions.length} 条记录</p>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
          
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-red-50 transition-colors active:bg-red-100"
          >
            <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
              <Trash2 size={18} className="text-red-500" />
            </div>
            <div className="flex-1 text-left">
              <span className="font-semibold text-red-500">清除所有数据</span>
              <p className="text-xs text-slate-400 mt-0.5">删除所有记录，不可恢复</p>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>

        {/* App Info */}
        <div className="text-center py-8 animate-list-item" style={{ animationDelay: '300ms' }}>
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mb-3 shadow-sm">
            <span className="text-3xl">💰</span>
          </div>
          <p className="font-semibold text-slate-700">小声记账 VoiceBook</p>
          <p className="text-sm text-slate-400 mt-1">让记账像说话一样简单</p>
        </div>
      </div>

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowClearConfirm(false)} />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 text-center mb-2">确定要清除所有数据吗？</h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              此操作不可恢复，所有账单记录将被永久删除。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-3 rounded-xl font-medium bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleClearData}
                className="flex-1 py-3 rounded-xl font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                确认清除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Edit Modal */}
      {(editingCategory || showAddCategory) && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => {
            setEditingCategory(null);
            setShowAddCategory(false);
          }} />
          <div className="relative w-full max-w-md bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCategory ? '编辑分类' : '添加分类'}
              </h2>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setShowAddCategory(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            {/* Icon Picker */}
            <div className="mb-4">
              <label className="block text-sm text-slate-500 mb-2">图标</label>
              <div className="flex flex-wrap gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setNewCategoryIcon(emoji)}
                    className={cn(
                      'w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all',
                      newCategoryIcon === emoji
                        ? 'bg-indigo-100 ring-2 ring-indigo-400'
                        : 'bg-slate-100 hover:bg-slate-200'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Name Input */}
            <div className="mb-4">
              <label className="block text-sm text-slate-500 mb-2">名称</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="分类名称"
                className="w-full px-4 py-2.5 bg-slate-50 rounded-xl border-2 border-transparent focus:bg-white focus:border-indigo-200 outline-none transition-all"
              />
            </div>

            {/* Type Selection */}
            <div className="mb-6">
              <label className="block text-sm text-slate-500 mb-2">类型</label>
              <div className="flex gap-2">
                {(['expense', 'income', 'both'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setNewCategoryType(type)}
                    className={cn(
                      'flex-1 py-2.5 rounded-xl font-medium transition-all',
                      newCategoryType === type
                        ? type === 'expense' ? 'bg-red-50 text-red-600 border-2 border-red-200' :
                          type === 'income' ? 'bg-emerald-50 text-emerald-600 border-2 border-emerald-200' :
                          'bg-indigo-50 text-indigo-600 border-2 border-indigo-200'
                        : 'bg-slate-50 text-slate-500 border-2 border-transparent'
                    )}
                  >
                    {type === 'expense' ? '支出' : type === 'income' ? '收入' : '通用'}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {editingCategory && (
                <button
                  onClick={() => {
                    deleteCategory(editingCategory.id);
                    setEditingCategory(null);
                  }}
                  className="py-3.5 px-4 rounded-xl font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                >
                  删除
                </button>
              )}
              <button
                onClick={editingCategory ? handleUpdateCategory : handleAddCategory}
                disabled={!newCategoryName.trim()}
                className={cn(
                  'flex-1 py-3.5 rounded-xl font-medium transition-all',
                  newCategoryName.trim()
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
