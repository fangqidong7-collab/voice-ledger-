export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryIcon: string;
  note: string;
  date: string;
  createdAt: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  keywords: string[];
  type: 'income' | 'expense' | 'both';
}

export interface AppSettings {
  currency: '¥' | '$' | '€';
  categories: Category[];
}

export type PageType = 'home' | 'detail' | 'stats' | 'settings';

export interface ParsedResult {
  amount: number;
  type: 'income' | 'expense';
  category: string;
  categoryIcon: string;
  note: string;
}
