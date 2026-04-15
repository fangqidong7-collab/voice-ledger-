import { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';
import { cn } from './lib/utils';

function PageTransition({ children, active }: { children: React.ReactNode; active: boolean }) {
  return (
    <div
      className={cn(
        'absolute inset-0 transition-all duration-300 ease-out',
        active ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'
      )}
    >
      {children}
    </div>
  );
}

function AppContent() {
  const { state, setPage } = useApp();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted || state.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">加载中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative overflow-hidden">
      {/* Page Container */}
      <div className="relative min-h-screen pb-16">
        <PageTransition active={state.currentPage === 'home'}>
          <HomePage />
        </PageTransition>
        <PageTransition active={state.currentPage === 'detail'}>
          <DetailPage />
        </PageTransition>
        <PageTransition active={state.currentPage === 'stats'}>
          <StatsPage />
        </PageTransition>
        <PageTransition active={state.currentPage === 'settings'}>
          <SettingsPage />
        </PageTransition>
      </div>
      
      {/* Bottom Navigation */}
      <BottomNav
        currentPage={state.currentPage}
        onPageChange={setPage}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
