import { Home, List, BarChart3, Settings } from 'lucide-react';
import { PageType } from '../types';
import { cn } from '../lib/utils';

interface BottomNavProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

const tabs = [
  { id: 'home' as PageType, label: '首页', icon: Home },
  { id: 'detail' as PageType, label: '明细', icon: List },
  { id: 'stats' as PageType, label: '统计', icon: BarChart3 },
  { id: 'settings' as PageType, label: '设置', icon: Settings },
];

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around px-4 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onPageChange(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-all duration-200',
              isActive ? 'text-indigo-500' : 'text-slate-400 hover:text-slate-600'
            )}
          >
            <Icon 
              size={22} 
              strokeWidth={isActive ? 2.5 : 2} 
              className={cn(
                'transition-transform duration-200',
                isActive && 'scale-110'
              )} 
            />
            <span className={cn(
              'text-xs font-medium',
              isActive && 'font-semibold'
            )}>
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
