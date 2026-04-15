import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Transaction, Category, AppSettings, PageType } from '../types';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import * as storage from '../utils/storage';
import { generateId } from '../utils/formatters';

interface AppState {
  transactions: Transaction[];
  categories: Category[];
  settings: AppSettings;
  currentPage: PageType;
  selectedMonth: string;
  searchQuery: string;
  isLoading: boolean;
}

type AppAction =
  | { type: 'SET_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: { id: string; updates: Partial<Transaction> } }
  | { type: 'DELETE_TRANSACTION'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'SET_CURRENCY'; payload: '¥' | '$' | '€' }
  | { type: 'SET_PAGE'; payload: PageType }
  | { type: 'SET_MONTH'; payload: string }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'CLEAR_ALL' }
  | { type: 'INIT'; payload: { transactions: Transaction[]; categories: Category[]; settings: AppSettings } };

const initialState: AppState = {
  transactions: [],
  categories: DEFAULT_CATEGORIES,
  settings: { currency: '¥', categories: DEFAULT_CATEGORIES },
  currentPage: 'home',
  selectedMonth: new Date().toISOString().slice(0, 7),
  searchQuery: '',
  isLoading: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'INIT':
      return {
        ...state,
        transactions: action.payload.transactions,
        categories: action.payload.categories,
        settings: action.payload.settings,
        isLoading: false,
      };
    case 'SET_TRANSACTIONS':
      return { ...state, transactions: action.payload };
    case 'ADD_TRANSACTION':
      return { ...state, transactions: [action.payload, ...state.transactions] };
    case 'UPDATE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
      };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(c => c.id !== action.payload),
      };
    case 'SET_CURRENCY':
      return { ...state, settings: { ...state.settings, currency: action.payload } };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_MONTH':
      return { ...state, selectedMonth: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'CLEAR_ALL':
      return { ...initialState, isLoading: false };
    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  addTransaction: (data: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (data: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, updates: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  setCurrency: (currency: '¥' | '$' | '€') => void;
  setPage: (page: PageType) => void;
  setMonth: (month: string) => void;
  setSearch: (query: string) => void;
  clearAllData: () => void;
  getFilteredTransactions: () => Transaction[];
  getMonthStats: () => { income: number; expense: number; balance: number };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const transactions = storage.getTransactions();
    const categories = storage.getCategories();
    const settings = storage.getSettings();
    dispatch({ type: 'INIT', payload: { transactions, categories, settings } });
  }, []);

  const addTransaction = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    const transaction: Transaction = {
      ...data,
      id: generateId(),
      createdAt: Date.now(),
    };
    storage.addTransaction(transaction);
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction });
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    storage.updateTransaction(id, updates);
    dispatch({ type: 'UPDATE_TRANSACTION', payload: { id, updates } });
  };

  const deleteTransaction = (id: string) => {
    storage.deleteTransaction(id);
    dispatch({ type: 'DELETE_TRANSACTION', payload: id });
  };

  const addCategory = (data: Omit<Category, 'id'>) => {
    const category: Category = {
      ...data,
      id: generateId(),
    };
    const newCategories = [...state.categories, category];
    storage.saveCategories(newCategories);
    dispatch({ type: 'ADD_CATEGORY', payload: category });
  };

  const updateCategory = (id: string, updates: Partial<Category>) => {
    const newCategories = state.categories.map(c =>
      c.id === id ? { ...c, ...updates } : c
    );
    storage.saveCategories(newCategories);
    dispatch({ type: 'UPDATE_CATEGORY', payload: { id, updates } });
  };

  const deleteCategory = (id: string) => {
    const newCategories = state.categories.filter(c => c.id !== id);
    storage.saveCategories(newCategories);
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const setCurrency = (currency: '¥' | '$' | '€') => {
    storage.saveSettings({ currency });
    dispatch({ type: 'SET_CURRENCY', payload: currency });
  };

  const setPage = (page: PageType) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const setMonth = (month: string) => {
    dispatch({ type: 'SET_MONTH', payload: month });
  };

  const setSearch = (query: string) => {
    dispatch({ type: 'SET_SEARCH', payload: query });
  };

  const clearAllData = () => {
    storage.clearAllData();
    dispatch({ type: 'CLEAR_ALL' });
  };

  const getFilteredTransactions = (): Transaction[] => {
    let filtered = state.transactions;
    
    // 按月份筛选
    if (state.selectedMonth) {
      filtered = filtered.filter(t => t.date.startsWith(state.selectedMonth));
    }
    
    // 按搜索筛选
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t.note.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  const getMonthStats = () => {
    const monthTransactions = state.transactions.filter(t =>
      t.date.startsWith(state.selectedMonth)
    );
    
    const income = monthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expense = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expense, balance: income - expense };
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        addCategory,
        updateCategory,
        deleteCategory,
        setCurrency,
        setPage,
        setMonth,
        setSearch,
        clearAllData,
        getFilteredTransactions,
        getMonthStats,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
