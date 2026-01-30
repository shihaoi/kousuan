# 口算题卡 - 儿童数学练习游戏

一款游戏化的口算练习应用，专为小学生设计，通过连击、护盾、速度星等游戏机制让数学练习更有趣。

## 预览

- **标准模式**: 15 道题，完整游戏体验
- **快速模式**: 10 道题，快节奏练习
- **限时挑战**: 2 分钟内尽可能多答题

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.x | React 框架 |
| React | 19.x | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 4.x | 样式系统 |
| Framer Motion | 12.x | 动画效果 |
| Radix UI | - | 无障碍组件 |
| Lucide React | - | 图标库 |

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+ (推荐) 或 npm/yarn

### 安装运行

```bash
# 克隆项目
git clone <repository-url>
cd 口算题卡yz

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 打开浏览器访问
open http://localhost:3000
```

### 构建部署

```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

## 项目结构

```
口算题卡yz/
├── app/                        # Next.js App Router
│   ├── globals.css             # 全局样式 & CSS 变量
│   ├── layout.tsx              # 根布局（元数据、字体）
│   └── page.tsx                # 首页入口
│
├── components/
│   ├── game/                   # 🎮 游戏核心组件
│   │   ├── game-container.tsx  # 游戏主容器（状态路由）
│   │   ├── game-start.tsx      # 开始页面（模式/难度选择）
│   │   ├── game-hud.tsx        # 顶部状态栏（分数、连击等）
│   │   ├── question-card.tsx   # 答题卡片（含动画）
│   │   ├── game-results.tsx    # 结果页面（统计、错题）
│   │   └── animations.tsx      # 可复用动画组件
│   │
│   ├── ui/                     # 🧩 通用 UI 组件 (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── ...                 # 其他 Radix 组件
│   │
│   └── theme-provider.tsx      # 主题切换支持
│
├── hooks/
│   ├── use-game.ts             # 🎯 核心游戏逻辑 Hook
│   ├── use-mobile.ts           # 移动端检测
│   └── use-toast.ts            # Toast 通知
│
├── lib/
│   ├── game-types.ts           # 📝 类型定义 & 游戏配置
│   ├── question-generator.ts   # 🔢 题目生成器
│   ├── sounds.ts               # 🔊 音效系统 (Web Audio API)
│   └── utils.ts                # 工具函数 (cn, etc.)
│
├── public/                     # 静态资源
│   ├── icon.svg
│   └── ...
│
└── styles/
    └── globals.css             # 备用样式文件
```

## 核心模块详解

### 1. 游戏状态管理 (`hooks/use-game.ts`)

游戏的核心逻辑集中在 `useGame` Hook 中：

```typescript
const {
  game,           // 当前游戏状态 (GameRun)
  startGame,      // 开始新游戏
  submitAnswer,   // 提交答案
  nextQuestion,   // 下一题
  retryQuestion,  // 重试当前题
  resetGame,      // 返回主页
  getStats,       // 获取统计数据
} = useGame()
```

**状态流转:**

```
idle → playing → finished
         ↓
    show → input → judge
              ↓
    correct / wrong_soft / wrong_final
```

### 2. 游戏配置 (`lib/game-types.ts`)

所有游戏参数都可在此调整：

```typescript
export const GAME_CONFIG = {
  questionsPerRunMain: 15,    // 标准模式题数
  questionsPerRunQuick: 10,   // 快速模式题数
  timeAttackSeconds: 120,     // 限时模式时长（秒）
  softTimeLimitSec: 6,        // 速度星时间阈值
  shieldPerRun: 1,            // 每局护盾数
  retryPerQuestion: 1,        // 每题重试次数
  bossCount: 1,               // Boss 题数量
  bossMultiplier: 1.5,        // Boss 题分数倍率
  baseScore: 100,             // 基础分数
  speedBonus: 20,             // 速度星加分
  comboThresholds: [2, 4, 6], // 连击倍率阈值
  comboMultipliers: [1.0, 1.2, 1.5, 2.0], // 对应倍率
}
```

### 3. 题目生成器 (`lib/question-generator.ts`)

按难度生成不同类型的题目：

| 难度 | 题目类型 |
|------|----------|
| 简单 | 两位数加减法、个位数加法 |
| 中等 | 三位数加减法、乘法表 (2-12) |
| 困难 | 复杂乘法 (11-25)、除法 |

**扩展题目类型:**

```typescript
// 在 DIFFICULTY_CONFIG 中添加新模板
const DIFFICULTY_CONFIG: Record<Difficulty, QuestionTemplate[]> = {
  easy: [
    // 添加新类型
    { num1Range: [1, 20], num2Range: [1, 20], operations: ['+', '-'] },
  ],
  // ...
}
```

### 4. 动画系统 (`components/game/question-card.tsx`)

使用 Framer Motion 实现的动画效果：

| 动画 | 组件/函数 | 触发时机 |
|------|-----------|----------|
| 答对动画 | `CorrectAnimation` | 答对时 |
| 连击动画 | `ComboAnimation` | combo ≥ 2 |
| 速度星 | `SpeedStarAnimation` | 快速答对 |
| 分数弹出 | `ScorePopAnimation` | 得分时 |
| 护盾激活 | `ShieldActiveAnimation` | 护盾使用 |
| 卡片抖动 | `showWrongAnimation` | 答错时 |

**添加新动画:**

```tsx
// 1. 创建动画组件
function MyAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 动画内容 */}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 2. 在 QuestionCard 中添加状态和触发逻辑
const [showMyAnim, setShowMyAnim] = useState(false)

// 3. 在 JSX 中使用
<MyAnimation show={showMyAnim} />
```

### 5. 音效系统 (`lib/sounds.ts`)

使用 Web Audio API 生成音效（无需加载音频文件）：

```typescript
playCorrectSound()     // 答对 - 上升音调
playWrongSound()       // 答错 - 下降音调
playComboSound(combo)  // 连击 - 琶音
playShieldSound()      // 护盾 - 保护音效
playSpeedStarSound()   // 速度星 - 星星音效
playFinishSound()      // 完成 - 结束曲
```

## 自定义指南

### 修改主题颜色

编辑 `app/globals.css` 中的 CSS 变量：

```css
:root {
  --primary: oklch(0.55 0.2 260);      /* 主色调 */
  --success: oklch(0.7 0.18 150);      /* 正确/成功 */
  --destructive: oklch(0.6 0.22 25);   /* 错误/危险 */
  --warning: oklch(0.8 0.16 80);       /* 警告/速度星 */
  --shield: oklch(0.65 0.15 230);      /* 护盾蓝 */
  --boss: oklch(0.75 0.18 45);         /* Boss 金 */
}
```

### 添加新游戏模式

1. **定义模式类型** (`lib/game-types.ts`):

```typescript
export type GameMode = 'main' | 'quick' | 'time_attack' | 'endless' // 添加新模式
```

2. **配置模式参数** (`components/game/game-start.tsx`):

```typescript
const MODES = [
  // ...现有模式
  {
    value: 'endless',
    label: '无尽模式',
    description: '挑战你的极限',
    icon: <Infinity className="h-5 w-5" />,
    questions: '∞'
  },
]
```

3. **处理模式逻辑** (`hooks/use-game.ts`):

```typescript
const startGame = useCallback((mode: GameMode, difficulty: Difficulty) => {
  const questionsCount = mode === 'endless' ? 999 : // 添加处理
    mode === 'main' ? GAME_CONFIG.questionsPerRunMain : ...
})
```

### 添加新题目类型（如分数）

1. **扩展运算符** (`lib/question-generator.ts`):

```typescript
type Operation = '+' | '-' | '*' | '/' | 'fraction'

// 在 generateExpression 中添加处理
case 'fraction':
  // 生成分数题
  const numerator = randomInt(1, 10)
  const denominator = randomInt(2, 10)
  return {
    expression: `${numerator}/${denominator} 化简`,
    answer: gcd(numerator, denominator)
  }
```

### 数据持久化

当前版本不保存数据。如需添加：

```typescript
// 使用 localStorage
const saveGameHistory = (stats: GameStats) => {
  const history = JSON.parse(localStorage.getItem('gameHistory') || '[]')
  history.push({ ...stats, date: Date.now() })
  localStorage.setItem('gameHistory', JSON.stringify(history))
}

// 或使用 IndexedDB / 后端 API
```

## 常见问题

### Q: Spring 动画报错 "Only two keyframes supported"

Framer Motion 的 `spring` 动画只支持 2 个关键帧。使用多关键帧时需指定 `ease`:

```typescript
// ❌ 错误
animate={{ scale: [1, 1.2, 1] }}
transition={{ type: "spring" }}

// ✅ 正确
animate={{ scale: [1, 1.2, 1] }}
transition={{ duration: 0.3, ease: "easeOut" }}
```

### Q: 如何禁用音效？

在 `lib/sounds.ts` 中添加开关：

```typescript
let soundEnabled = true
export const toggleSound = () => soundEnabled = !soundEnabled

export function playCorrectSound() {
  if (!soundEnabled) return
  // ...
}
```

### Q: 如何添加更多难度级别？

1. 扩展 `Difficulty` 类型
2. 在 `DIFFICULTY_CONFIG` 添加配置
3. 在 `DIFFICULTIES` 数组添加 UI

## 开发命令

```bash
pnpm dev        # 启动开发服务器 (Turbopack)
pnpm build      # 生产构建
pnpm start      # 启动生产服务器
pnpm lint       # 代码检查
```

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

MIT License - 自由使用和修改

---

**Made with ❤️ for young learners**
