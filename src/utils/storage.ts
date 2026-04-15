import { Transaction, Category, AppSettings } from '../types';
import { STORAGE_KEYS, DEFAULT_CATEGORIES } from '../constants/categories';

class StorageError extends Error {
  constructor(message: string, public readonly code: 'QUOTA_EXCEEDED' | 'NOT_AVAILABLE' | 'PARSE_ERROR') {
    super(message);
    this.name = 'StorageError';
  }
}

function checkStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

function checkStorageQuota(): { available: boolean; used: number } {
  try {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage.getItem(key)?.length || 0;
      }
    }
    // 估算使用量 (UTF-16 字符 * 2 bytes)
    const used = total * 2;
    // localStorage 通常限制为 5MB
    const maxSize = 5 * 1024 * 1024;
    return { available: used < maxSize * 0.9, used };
  } catch {
    return { available: false, used: 0 };
  }
}

export function getTransactions(): Transaction[] {
  if (!checkStorageAvailable()) {
    console.warn('localStorage 不可用');
    return [];
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!data) return [];
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) {
      console.warn('事务数据格式错误');
      return [];
    }
    
    return parsed;
  } catch (err) {
    console.error('读取事务数据失败:', err);
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (!checkStorageAvailable()) {
    throw new StorageError('存储不可用，请检查浏览器设置', 'NOT_AVAILABLE');
  }
  
  const quota = checkStorageQuota();
  if (!quota.available) {
    throw new StorageError('存储空间即将用尽，请导出数据并清理', 'QUOTA_EXCEEDED');
  }
  
  try {
    const data = JSON.stringify(transactions);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, data);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new StorageError('存储空间已满，请导出数据并清理旧记录', 'QUOTA_EXCEEDED');
    }
    throw new StorageError('保存数据失败', 'NOT_AVAILABLE');
  }
}

export function addTransaction(transaction: Transaction): Transaction[] {
  const transactions = getTransactions();
  transactions.unshift(transaction);
  saveTransactions(transactions);
  return transactions;
}

export function updateTransaction(id: string, updates: Partial<Transaction>): Transaction[] {
  const transactions = getTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions);
  }
  return transactions;
}

export function deleteTransaction(id: string): Transaction[] {
  const transactions = getTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
  return filtered;
}

export function getCategories(): Category[] {
  if (!checkStorageAvailable()) {
    return DEFAULT_CATEGORIES;
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!data) return DEFAULT_CATEGORIES;
    
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return DEFAULT_CATEGORIES;
    }
    
    return parsed;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  if (!checkStorageAvailable()) {
    throw new StorageError('存储不可用', 'NOT_AVAILABLE');
  }
  
  try {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new StorageError('存储空间已满', 'QUOTA_EXCEEDED');
    }
    throw new StorageError('保存失败', 'NOT_AVAILABLE');
  }
}

export function getSettings(): AppSettings {
  if (!checkStorageAvailable()) {
    return {
      currency: '¥',
      categories: DEFAULT_CATEGORIES,
    };
  }
  
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (data) {
      const settings = JSON.parse(data);
      return {
        ...settings,
        categories: getCategories(),
      };
    }
  } catch {
    // ignore
  }
  
  return {
    currency: '¥',
    categories: DEFAULT_CATEGORIES,
  };
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  const current = getSettings();
  const updated = { ...current, ...settings };
  
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({
      currency: updated.currency,
    }));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      throw new StorageError('存储空间已满', 'QUOTA_EXCEEDED');
    }
  }
  
  return updated;
}

export function clearAllData(): void {
  if (!checkStorageAvailable()) {
    throw new StorageError('存储不可用', 'NOT_AVAILABLE');
  }
  
  try {
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  } catch {
    throw new StorageError('清除数据失败', 'NOT_AVAILABLE');
  }
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['日期', '时间', '类型', '分类', '图标', '金额', '备注'];
  const rows = transactions.map(t => [
    t.date,
    new Date(t.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    t.type === 'income' ? '收入' : '支出',
    t.category,
    t.categoryIcon,
    t.amount.toFixed(2),
    `"${t.note.replace(/"/g, '""')}"`,
  ]);
  
  // 添加 BOM 以支持 Excel 打开 UTF-8 编码的 CSV
  return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function getStorageInfo(): { recordCount: number; estimatedSize: string } {
  const transactions = getTransactions();
  let size = 0;
  
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      size += (localStorage.getItem(key)?.length || 0) * 2; // UTF-16
    }
  }
  
  let sizeStr = '';
  if (size < 1024) {
    sizeStr = `${size} B`;
  } else if (size < 1024 * 1024) {
    sizeStr = `${(size / 1024).toFixed(1)} KB`;
  } else {
    sizeStr = `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
  
  return {
    recordCount: transactions.length,
    estimatedSize: sizeStr,
  };
}
