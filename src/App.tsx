import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/BottomNav';
import { HomePage } from './pages/HomePage';
import { DetailPage } from './pages/DetailPage';
import { StatsPage } from './pages/StatsPage';
import { SettingsPage } from './pages/SettingsPage';

function AppContent() {
  const { state, setPage } = useApp();
  
  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 max-w-md mx-auto relative">
      {state.currentPage === 'home' && <HomePage />}
      {state.currentPage === 'detail' && <DetailPage />}
      {state.currentPage === 'stats' && <StatsPage />}
      {state.currentPage === 'settings' && <SettingsPage />}
      
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
