import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthPickerProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export function MonthPicker({ selectedMonth, onMonthChange }: MonthPickerProps) {
  const [year, month] = selectedMonth.split('-').map(Number);
  
  const goToPrevMonth = () => {
    if (month === 1) {
      onMonthChange(`${year - 1}-12`);
    } else {
      onMonthChange(`${year}-${(month - 1).toString().padStart(2, '0')}`);
    }
  };
  
  const goToNextMonth = () => {
    if (month === 12) {
      onMonthChange(`${year + 1}-01`);
    } else {
      onMonthChange(`${year}-${(month + 1).toString().padStart(2, '0')}`);
    }
  };
  
  const isFutureMonth = new Date(selectedMonth) > new Date();

  return (
    <div className="flex items-center justify-center gap-4">
      <button
        onClick={goToPrevMonth}
        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
      >
        <ChevronLeft size={20} className="text-slate-600" />
      </button>
      
      <div className="flex flex-col items-center min-w-[100px]">
        <span className="text-lg font-bold text-slate-800">{year}年</span>
        <span className="text-sm font-semibold text-indigo-600">
          {MONTH_NAMES[month - 1]}
        </span>
      </div>
      
      <button
        onClick={goToNextMonth}
        disabled={isFutureMonth}
        className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={20} className={isFutureMonth ? 'text-slate-300' : 'text-slate-600'} />
      </button>
    </div>
  );
}
