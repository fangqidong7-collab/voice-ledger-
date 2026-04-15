# 项目上下文

## 技术栈

- **核心**: React 19, Vite 7, TypeScript
- **UI**: Tailwind CSS, Recharts
- **状态管理**: React Context + useReducer
- **存储**: localStorage

## 目录结构

```
src/
├── components/           # UI 组件
│   ├── ui/              # 基础 UI 组件
│   ├── BottomNav.tsx    # 底部导航栏
│   ├── VoiceButton.tsx  # 语音按钮
│   ├── StatCard.tsx     # 数据卡片
│   ├── TransactionItem.tsx  # 账单项
│   ├── ConfirmModal.tsx # 确认弹窗
│   ├── CategoryPicker.tsx  # 分类选择器
│   ├── MonthPicker.tsx  # 月份选择器
│   └── ManualInputForm.tsx  # 手动输入表单
├── pages/               # 页面组件
│   ├── HomePage.tsx    # 首页
│   ├── DetailPage.tsx  # 明细页
│   ├── StatsPage.tsx   # 统计页
│   └── SettingsPage.tsx  # 设置页
├── context/
│   └── AppContext.tsx  # 全局状态管理
├── hooks/
│   └── useSpeechRecognition.ts  # 语音识别 Hook
├── utils/
│   ├── parser.ts       # 语音解析逻辑
│   ├── formatters.ts   # 格式化工具
│   └── storage.ts      # localStorage 封装
├── constants/
│   └── categories.ts   # 预设分类
├── types/
│   └── index.ts        # 类型定义
├── lib/
│   └── utils.ts        # 工具函数
├── App.tsx
├── main.tsx
└── index.css
```

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- 使用 Tailwind CSS 进行样式开发
- 使用 React 19 函数组件 + Hooks
- 使用 TypeScript strict 模式

### 编码规范

- 默认按 TypeScript `strict` 心智写代码；优先复用当前作用域已声明的变量、函数、类型和导入，禁止引用未声明标识符或拼错变量名。
- 禁止隐式 `any` 和 `as any`；函数参数、返回值、解构项、事件对象在使用前应有明确类型或先完成类型收窄，并清理未使用的变量和导入。
- 组件文件使用 `.tsx` 扩展名

## 数据结构

```typescript
interface Transaction {
  id: string;                    // UUID
  amount: number;                // 金额（正数）
  type: 'income' | 'expense';    // 收入/支出
  category: string;               // 分类名称
  categoryIcon: string;          // emoji 图标
  note: string;                  // 备注
  date: string;                   // ISO 日期 "YYYY-MM-DD"
  createdAt: number;              // 创建时间戳
}

interface Category {
  id: string;
  name: string;
  icon: string;                  // emoji
  keywords: string[];             // 匹配关键词
  type: 'income' | 'expense' | 'both';
}
```

## localStorage 结构

- `voicebook_transactions`: Transaction[]
- `voicebook_categories`: Category[]
- `voicebook_settings`: AppSettings

## 启动开发服务器

项目默认运行在 5000 端口，使用 `pnpm dev` 启动开发服务器。
