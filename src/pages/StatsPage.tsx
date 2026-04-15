import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

type TimeRange = 'week' | 'month' | 'year';

const EXPENSE_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#84CC16', '#22C55E',
  '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9', '#3B82F6',
];

export function StatsPage() {
  const { state } = useApp();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  
  const filteredTransactions = useMemo(() => {
    let filtered = state.transactions.filter(t => t.type === 'expense');
    const now = new Date();
    
    if (timeRange === 'week') {
      const weekStart = new Date(now);
      const day = weekStart.getDay();
      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
      weekStart.setDate(diff);
      weekStart.setHours(0, 0, 0, 0);
      filtered = filtered.filter(t => new Date(t.date) >= weekStart);
    } else if (timeRange === 'month') {
      filtered = filtered.filter(t => t.date.startsWith(state.selectedMonth));
    } else {
      filtered = filtered.filter(t => t.date.startsWith(now.getFullYear().toString()));
    }
    
    return filtered;
  }, [state.transactions, timeRange, state.selectedMonth]);
  
  // Bar chart data
  const barChartData = useMemo(() => {
    if (timeRange === 'week') {
      const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      return days.map((day, index) => {
        const date = new Date();
        const dayOfWeek = date.getDay();
        const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) + index;
        date.setDate(diff);
        const dateStr = date.toISOString().slice(0, 10);
        const dayTotal = filteredTransactions
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: day, amount: dayTotal };
      });
    } else if (timeRange === 'month') {
      const daysInMonth = new Date(
        parseInt(state.selectedMonth.split('-')[0]),
        parseInt(state.selectedMonth.split('-')[1]),
        0
      ).getDate();
      
      return Array.from({ length: Math.min(daysInMonth, 31) }, (_, i) => {
        const day = (i + 1).toString().padStart(2, '0');
        const dateStr = `${state.selectedMonth}-${day}`;
        const dayTotal = filteredTransactions
          .filter(t => t.date === dateStr)
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: `${i + 1}日`, amount: dayTotal };
      });
    } else {
      const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
      const year = new Date().getFullYear();
      return months.map((month, index) => {
        const monthStr = `${year}-${(index + 1).toString().padStart(2, '0')}`;
        const monthTotal = filteredTransactions
          .filter(t => t.date.startsWith(monthStr))
          .reduce((sum, t) => sum + t.amount, 0);
        return { name: month, amount: monthTotal };
      });
    }
  }, [filteredTransactions, timeRange, state.selectedMonth]);
  
  // Pie chart data
  const pieChartData = useMemo(() => {
    const categoryTotals: Record<string, { amount: number; icon: string; name: string }> = {};
    
    filteredTransactions.forEach(t => {
      if (!categoryTotals[t.category]) {
        categoryTotals[t.category] = { amount: 0, icon: t.categoryIcon, name: t.category };
      }
      categoryTotals[t.category].amount += t.amount;
    });
    
    return Object.values(categoryTotals)
      .sort((a, b) => b.amount - a.amount)
      .map((item, index) => ({
        name: item.name,
        value: item.amount,
        icon: item.icon,
        color: EXPENSE_COLORS[index % EXPENSE_COLORS.length],
      }));
  }, [filteredTransactions]);
  
  const totalExpense = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 border-b border-slate-100">
        <h1 className="text-xl font-bold text-slate-800 mb-4">统计报表</h1>
        
        {/* Time Range Tabs */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'flex-1 py-2 rounded-lg text-sm font-medium transition-all',
                timeRange === range
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {range === 'week' ? '本周' : range === 'month' ? '本月' : '本年'}
            </button>
          ))}
        </div>
      </div>
      
      <div className="px-4 py-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3 animate-list-item" style={{ animationDelay: '0ms' }}>
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingDown size={14} className="text-red-500" />
              <span className="text-xs text-red-600 font-medium">支出</span>
            </div>
            <div className="text-xl font-bold text-red-600 font-mono">
              -{formatCurrency(totalExpense, state.settings.currency)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp size={14} className="text-emerald-500" />
              <span className="text-xs text-emerald-600 font-medium">收入</span>
            </div>
            <div className="text-xl font-bold text-emerald-600 font-mono">
              +{formatCurrency(
                state.transactions
                  .filter(t => {
                    if (t.type !== 'income') return false;
                    if (timeRange === 'week') {
                      const weekStart = new Date();
                      const day = weekStart.getDay();
                      const diff = weekStart.getDate() - day + (day === 0 ? -6 : 1);
                      weekStart.setDate(diff);
                      return new Date(t.date) >= weekStart;
                    } else if (timeRange === 'month') {
                      return t.date.startsWith(state.selectedMonth);
                    } else {
                      return t.date.startsWith(new Date().getFullYear().toString());
                    }
                  })
                  .reduce((sum, t) => sum + t.amount, 0),
                state.settings.currency
              )}
            </div>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">支出趋势</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  formatter={(value) => [formatCurrency(value as number, state.settings.currency), '支出']}
                />
                <Bar 
                  dataKey="amount" 
                  fill="#EF4444" 
                  radius={[4, 4, 0, 0]}
                  maxBarSize={timeRange === 'year' ? 30 : 20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">支出分布</h2>
          {pieChartData.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400">
              暂无数据
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                    formatter={(value) => formatCurrency(value as number, state.settings.currency)}
                  />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Center text */}
              <div className="-mt-48 text-center">
                <div className="text-xs text-slate-400">总支出</div>
                <div className="text-lg font-bold text-slate-800 font-mono">
                  {formatCurrency(totalExpense, state.settings.currency)}
                </div>
              </div>
            </div>
          )}
          
          {/* Legend */}
          {pieChartData.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {pieChartData.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-xs text-slate-600 truncate flex-1">{item.name}</span>
                  <span className="text-xs font-medium text-slate-700 font-mono">
                    {((item.value / totalExpense) * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Ranking */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-800 mb-4">消费排行榜</h2>
          {pieChartData.length === 0 ? (
            <div className="py-8 text-center text-slate-400">
              暂无数据
            </div>
          ) : (
            <div className="space-y-3">
              {pieChartData.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                    index === 0 ? 'bg-amber-100 text-amber-600' :
                    index === 1 ? 'bg-slate-100 text-slate-600' :
                    index === 2 ? 'bg-orange-100 text-orange-600' :
                    'bg-slate-50 text-slate-400'
                  )}>
                    {index + 1}
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-lg">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-slate-800">{item.name}</div>
                    <div className="h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${(item.value / totalExpense) * 100}%`,
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800 font-mono">
                      {formatCurrency(item.value, state.settings.currency)}
                    </div>
                    <div className="text-xs text-slate-400">
                      {((item.value / totalExpense) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
