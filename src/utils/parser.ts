import { ParsedResult, Category } from '../types';
import { CHINESE_NUMBERS, INCOME_KEYWORDS, DEFAULT_CATEGORIES } from '../constants/categories';

function chineseToNumber(str: string): number {
  let result = 0;
  let temp = 0;
  let unit = 1;
  
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str[i];
    const value = CHINESE_NUMBERS[char];
    
    if (value !== undefined) {
      if (value >= 10) {
        if (value === 10000) {
          result += temp * unit * value;
          temp = 0;
          unit = 1;
        } else if (value === 100000000) {
          result = (result + temp) * value;
          temp = 0;
          unit = 1;
        } else {
          unit = value;
        }
      } else {
        temp += value * unit;
      }
    } else if (char === '点') {
      result += temp;
      temp = 0;
    }
  }
  
  return result + temp;
}

function extractAmount(text: string): number | null {
  // 匹配阿拉伯数字
  const arabicMatch = text.match(/(\d+\.?\d*)/);
  if (arabicMatch) {
    const num = parseFloat(arabicMatch[1]);
    if (!isNaN(num) && num > 0) {
      return num;
    }
  }
  
  // 匹配中文数字
  const chineseNumMap: Record<string, string> = {
    '零': '0', '〇': '0', '一': '1', '二': '2', '两': '2',
    '三': '3', '四': '4', '五': '5', '六': '6', '七': '7',
    '八': '8', '九': '9', '十': '10', '百': '100',
  };
  
  const chinesePattern = /([零〇一二两三四五六七八九十百]+点?[零〇一二三四五六七八九]*)/g;
  const chineseMatch = text.match(chinesePattern);
  
  if (chineseMatch) {
    for (const match of chineseMatch) {
      let numStr = match;
      
      // 处理 "十" 开头的特殊情况（如"十块"、"十五"）
      if (numStr.startsWith('十')) {
        numStr = '1' + numStr.slice(1);
      }
      
      // 将中文数字转换为阿拉伯数字
      let num = 0;
      let temp = '';
      let hasPoint = false;
      
      for (const char of numStr) {
        if (char === '点') {
          hasPoint = true;
          if (temp) {
            num += chineseToNumber(temp);
            temp = '';
          }
        } else if (chineseNumMap[char] !== undefined) {
          temp += chineseNumMap[char];
        }
      }
      
      if (temp) {
        num += parseFloat('0.' + temp) || chineseToNumber(temp);
      }
      
      if (num > 0) {
        return hasPoint ? num : Math.floor(num);
      }
    }
  }
  
  return null;
}

function determineType(text: string): 'income' | 'expense' {
  const lowerText = text.toLowerCase();
  return INCOME_KEYWORDS.some(keyword => lowerText.includes(keyword)) ? 'income' : 'expense';
}

function matchCategory(text: string, type: 'income' | 'expense', categories: Category[]): { category: string; categoryIcon: string } {
  const lowerText = text.toLowerCase();
  
  // 优先匹配自定义分类
  for (const cat of categories) {
    if (cat.type === type || cat.type === 'both') {
      for (const keyword of cat.keywords) {
        if (lowerText.includes(keyword)) {
          return { category: cat.name, categoryIcon: cat.icon };
        }
      }
    }
  }
  
  // 默认分类
  const defaultCat = type === 'income' 
    ? categories.find(c => c.id === 'salary') || categories[7]
    : categories.find(c => c.id === 'other') || categories[9];
  
  return { category: defaultCat.name, categoryIcon: defaultCat.icon };
}

export function parseVoiceInput(text: string, categories: Category[] = DEFAULT_CATEGORIES): ParsedResult {
  const amount = extractAmount(text) || 0;
  const type = determineType(text);
  const { category, categoryIcon } = matchCategory(text, type, categories);
  
  return {
    amount,
    type,
    category,
    categoryIcon,
    note: text,
  };
}
