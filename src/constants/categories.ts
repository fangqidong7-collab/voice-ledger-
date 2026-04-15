import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: '餐饮',
    icon: '🍔',
    keywords: ['吃饭', '外卖', '午餐', '晚餐', '早餐', '饮料', '咖啡', '奶茶', '火锅', '烧烤', '美食'],
    type: 'expense',
  },
  {
    id: 'transport',
    name: '交通',
    icon: '🚗',
    keywords: ['打车', '地铁', '公交', '加油', '停车', '高速', '滴滴', '出租车', '骑车'],
    type: 'expense',
  },
  {
    id: 'shopping',
    name: '购物',
    icon: '🛒',
    keywords: ['买', '购物', '淘宝', '京东', '超市', '商场', '衣服', '鞋子', '包'],
    type: 'expense',
  },
  {
    id: 'housing',
    name: '居住',
    icon: '🏠',
    keywords: ['房租', '水电', '物业', '维修', '家具', '装修'],
    type: 'expense',
  },
  {
    id: 'entertainment',
    name: '娱乐',
    icon: '🎮',
    keywords: ['电影', '游戏', 'KTV', '旅游', '门票', '演唱会', '酒吧', '健身'],
    type: 'expense',
  },
  {
    id: 'medical',
    name: '医疗',
    icon: '💊',
    keywords: ['医院', '看病', '药', '体检', '牙医', '疫苗'],
    type: 'expense',
  },
  {
    id: 'education',
    name: '教育',
    icon: '📚',
    keywords: ['课程', '书', '培训', '学费', '文具', '考试'],
    type: 'expense',
  },
  {
    id: 'salary',
    name: '工资',
    icon: '💰',
    keywords: ['工资', '薪水', '奖金', '补贴', '分红'],
    type: 'income',
  },
  {
    id: 'transfer',
    name: '转账',
    icon: '🔄',
    keywords: ['转账', '红包', '收款', '付款'],
    type: 'both',
  },
  {
    id: 'other',
    name: '其他',
    icon: '📦',
    keywords: [],
    type: 'both',
  },
];

export const INCOME_KEYWORDS = ['工资', '收到', '赚了', '进账', '发钱', '奖金', '分红', '补贴', '收款'];

export const CHINESE_NUMBERS: Record<string, number> = {
  '零': 0, '〇': 0, '一': 1, '二': 2, '两': 2, '三': 3, '四': 4,
  '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '百': 100, '千': 1000, '万': 10000, '亿': 100000000,
};

export const STORAGE_KEYS = {
  TRANSACTIONS: 'voicebook_transactions',
  CATEGORIES: 'voicebook_categories',
  SETTINGS: 'voicebook_settings',
};
