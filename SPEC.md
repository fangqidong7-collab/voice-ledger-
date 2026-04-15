# 小声记账 (VoiceBook) - 产品规格文档

## 1. Concept & Vision

**小声记账**是一款极简而温暖的语音记账应用，让记账回归本质——说句话就能记。整个应用以「轻声细语」为设计理念，界面柔和、交互轻盈，让用户在快节奏生活中找到一丝宁静。核心体验是「按住说话，松手即记」，配合智能语义解析，真正做到「所想即所记」。

## 2. Design Language

### 2.1 美学方向
- **风格**：温暖极简主义 (Warm Minimalism)
- **灵感**：类 iOS 原生记账应用的克制美学 + 柔和色彩心理学
- **基调**：温暖、轻松、值得信赖

### 2.2 色彩系统
```
Primary:      #6366F1 (Indigo 500) - 主品牌色，用于关键操作和强调
Secondary:    #8B5CF6 (Violet 500) - 辅助色，用于次要交互
Accent:       #F59E0B (Amber 500)  - 语音按钮高亮色

语义色彩：
- Expense:    #EF4444 (Red 500)    - 支出标识
- Income:     #10B981 (Emerald 500) - 收入标识
- Balance:    #3B82F6 (Blue 500)    - 结余标识

背景层次：
- Base:       #F8FAFC (Slate 50)   - 页面底色
- Card:       #FFFFFF              - 卡片背景
- Muted:      #F1F5F9 (Slate 100)  - 次级背景

文字层次：
- Primary:    #1E293B (Slate 800) - 主文字
- Secondary:  #64748B (Slate 500) - 次要文字
- Muted:     #94A3B8 (Slate 400) - 弱化文字
```

### 2.3 字体
- **主字体**：系统字体栈 `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **数字字体**：`"SF Mono", "Menlo", monospace` 用于金额显示
- **字号系统**：
  - H1 (页面标题): 28px / Bold
  - H2 (卡片标题): 20px / Semibold
  - Body: 16px / Regular
  - Caption: 14px / Regular
  - Small: 12px / Regular

### 2.4 空间系统
- **基础单位**：4px
- **间距层级**：4, 8, 12, 16, 24, 32, 48, 64px
- **卡片圆角**：16px
- **按钮圆角**：12px (小) / 全圆 (语音按钮)
- **安全边距**：16px (移动端)

### 2.5 动效哲学
- **整体原则**：轻量、自然、不打断
- **时长基准**：150ms (微交互) / 300ms (状态切换) / 500ms (页面过渡)
- **缓动函数**：`cubic-bezier(0.4, 0, 0.2, 1)`
- **语音按钮动画**：脉冲 + 声波扩散，呼吸感
- **列表动画**：淡入 + 微上移，交错 50ms

### 2.6 图标系统
- 使用 Lucide React 图标库（线性风格，2px 描边）
- 分类图标使用 emoji 作为视觉锚点

## 3. Layout & Structure

### 3.1 整体架构
```
┌─────────────────────────────────┐
│         Safe Area Top          │
├─────────────────────────────────┤
│                                 │
│        Page Content Area       │
│        (Scrollable)             │
│                                 │
├─────────────────────────────────┤
│        Bottom Navigation        │
│         (Fixed, 64px)          │
└─────────────────────────────────┘
```

### 3.2 页面清单
1. **首页** - 记账主战场，语音输入入口
2. **明细** - 账单流水，支持搜索和日期筛选
3. **统计** - 可视化报表，数据洞察
4. **设置** - 个性化配置，数据管理

### 3.3 响应式策略
- 移动优先设计，最大宽度 480px 居中
- 平板及以上设备两侧留白

## 4. Features & Interactions

### 4.1 首页功能

#### 4.1.1 顶部数据卡片
- **布局**：三个等宽卡片横向排列
- **内容**：
  - 支出卡片（红色）：显示「本月支出 ¥X,XXX」
  - 收入卡片（绿色）：显示「本月收入 ¥X,XXX」
  - 结余卡片（蓝色）：显示「本月结余 ¥X,XXX」
- **交互**：点击可跳转至统计页面
- **动画**：数字变化时使用滚动动画

#### 4.1.2 语音记账按钮
- **外观**：直径 120px 的大型圆形按钮
- **状态**：
  - **待机**：渐变紫色背景 + 麦克风图标
  - **录音中**：脉冲动画 + 红色圆环 + 声波动画 + 持续时间显示
  - **识别中**：旋转加载动画 + "正在识别..."
  - **识别完成**：自动弹出确认卡片
- **交互**：
  - 点击切换录音状态
  - 长按拖动可取消录音（拖出按钮区域）
- **降级**：不支持语音时显示手动输入表单

#### 4.1.3 确认卡片（Modal）
- **触发**：识别完成后自动弹出
- **内容**：金额输入框、类型选择（收入/支出）、分类选择、备注输入
- **交互**：
  - 所有字段可编辑
  - 「确认」保存记录，「取消」丢弃
- **动画**：从底部滑入 + 背景模糊

#### 4.1.4 今日账单列表
- **布局**：垂直滚动列表
- **每项内容**：分类图标 | 描述/备注 | 金额（收入+绿/支出-红）| 时间
- **空状态**：显示插画 + "今天还没有记账哦~"
- **交互**：点击跳转到明细页该条记录

### 4.2 明细页功能

#### 4.2.1 月份切换器
- **布局**：顶部居中，当前月份大字显示
- **交互**：左右箭头切换月份，点击可打开月份选择器

#### 4.2.2 搜索框
- **位置**：月份切换器下方
- **功能**：实时搜索账单备注和分类
- **交互**：清空按钮 / 取消搜索

#### 4.2.3 账单分组列表
- **分组逻辑**：按日期分组，最新在前
- **日期组头**：日期文字 + 当日小计
- **单项内容**：分类图标 | 备注 | 类型标签 | 金额 | 时间
- **单项交互**：
  - 点击：打开编辑弹窗
  - 左滑：显示删除按钮
- **删除确认**：二次确认弹窗

#### 4.2.4 编辑弹窗
- **内容**：与确认卡片相同
- **操作**：保存 / 删除 / 取消

### 4.3 统计页功能

#### 4.3.1 时间维度切换
- **Tab 布局**：周 / 月 / 年 三个选项
- **默认**：当月

#### 4.3.2 收支趋势图
- **类型**：柱状图（收入/支出对比）
- **库**：Recharts
- **交互**：悬停显示具体数值

#### 4.3.3 分类占比饼图
- **类型**：环形图
- **交互**：点击分类可筛选
- **中心**：显示总金额

#### 4.3.4 消费排行榜
- **布局**：垂直列表
- **每项**：排名 | 分类图标+名称 | 金额 | 占比百分比
- **排序**：按金额降序

### 4.4 设置页功能

#### 4.4.1 分类管理
- **布局**：列表 + 添加按钮
- **每项**：图标选择器 | 名称输入 | 删除按钮
- **预设分类**：
  - 🍔 餐饮、🚗 交通、🛒 购物、🏠 居住、🎮 娱乐、💊 医疗、📚 教育、💰 工资、🔄 转账、📦 其他

#### 4.4.2 数据导出
- **功能**：导出为 CSV 文件
- **内容**：日期、类型、分类、金额、备注

#### 4.4.3 数据清除
- **流程**：点击 → 二次确认 → 彻底清除
- **弹窗样式**：红色警示风格

#### 4.4.4 货币设置
- **选项**：¥ (人民币) / $ (美元) / € (欧元)
- **默认值**：¥

## 5. Component Inventory

### 5.1 语音按钮 (VoiceButton)
- **状态**：idle / recording / processing / error / unsupported
- **尺寸**：120px 直径
- **动画**：脉冲 (idle→recording) / 声波 (recording) / 旋转 (processing)

### 5.2 数据卡片 (StatCard)
- **变体**：expense / income / balance
- **内容**：图标、标签、数值
- **尺寸**：等宽三列，高度 100px

### 5.3 账单项 (TransactionItem)
- **内容**：图标、备注、金额、时间
- **状态**：default / selected / swiping / deleting
- **交互**：点击 / 左滑

### 5.4 底部导航 (BottomNav)
- **Tab 数**：4
- **图标**：首页(Home)、明细(List)、统计(Chart)、设置(Settings)
- **状态**：default / active

### 5.5 确认弹窗 (ConfirmModal)
- **内容**：可编辑表单
- **按钮**：确认(主色) / 取消(灰色)

### 5.6 分类选择器 (CategoryPicker)
- **类型**：网格选择器
- **尺寸**：每个选项 64px

### 5.7 月份选择器 (MonthPicker)
- **交互**：左右切换 / 点击打开选择器

## 6. Technical Approach

### 6.1 技术栈
- **框架**：React 19 + TypeScript
- **构建**：Vite
- **样式**：Tailwind CSS
- **图表**：Recharts
- **状态**：React Context + useReducer
- **存储**：localStorage
- **图标**：Lucide React

### 6.2 数据模型
```typescript
interface Transaction {
  id: string;                    // UUID
  amount: number;                // 金额（正数）
  type: 'income' | 'expense';    // 收入/支出
  category: string;               // 分类名称
  categoryIcon: string;           // emoji 图标
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

interface AppSettings {
  currency: '¥' | '$' | '€';
  categories: Category[];
}
```

### 6.3 localStorage 结构
```json
{
  "voicebook_transactions": Transaction[],
  "voicebook_categories": Category[],
  "voicebook_settings": AppSettings
}
```

### 6.4 语音识别实现
- 使用 Web Speech API (SpeechRecognition)
- 语言：zh-CN
- 模式：连续识别
- 结果：实时拼接
- 降级：显示手动输入表单

### 6.5 智能解析规则
- **金额**：正则匹配数字和中文数字
  - 阿拉伯数字：`/\d+\.?\d*/`
  - 中文数字：`/[一二两三四五六七八九十百千万零〇点分]+/`
- **类型**：关键词检测
  - 收入：`工资|收到|赚了|进账|发钱`
  - 支出：默认
- **分类**：关键词匹配映射表

### 6.6 目录结构
```
src/
├── components/
│   ├── ui/                 # 基础 UI 组件
│   ├── VoiceButton.tsx
│   ├── StatCard.tsx
│   ├── TransactionItem.tsx
│   ├── BottomNav.tsx
│   ├── ConfirmModal.tsx
│   ├── CategoryPicker.tsx
│   └── MonthPicker.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── DetailPage.tsx
│   ├── StatsPage.tsx
│   └── SettingsPage.tsx
├── context/
│   └── AppContext.tsx
├── hooks/
│   ├── useSpeechRecognition.ts
│   └── useLocalStorage.ts
├── utils/
│   ├── parser.ts           # 语音解析逻辑
│   ├── formatters.ts       # 格式化工具
│   └── storage.ts          # localStorage 封装
├── constants/
│   └── categories.ts       # 预设分类
├── types/
│   └── index.ts            # 类型定义
├── App.tsx
└── main.tsx
```
