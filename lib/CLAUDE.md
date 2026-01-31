# lib - 核心逻辑库 (L2)

> 父级: [/CLAUDE.md](../CLAUDE.md)
> 最后更新: 2026-01-31

---

## 📍 模块定位

纯函数 + 类型定义 + 配置常量。无 React 依赖，可独立测试。

---

## 📁 成员清单

| 文件 | 职责 | 纯函数? |
|------|------|---------|
| `game-types.ts` | 类型 + 配置 + 计算函数 | ✅ |
| `question-generator.ts` | 题目生成 + 输入解析 | ✅ |
| `sounds.ts` | 音效播放 | ❌ (浏览器 API) |
| `utils.ts` | 通用工具 (cn) | ✅ |

---

## 🔌 暴露接口

### game-types.ts

```typescript
// 配置常量
export const GAME_CONFIG: GameConfig

// 类型
export type GameMode = 'main' | 'quick' | 'time_attack'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionResult = 'correct' | 'wrong' | 'skip' | 'pending'
export type RunState = 'idle' | 'ready' | 'playing' | 'paused' | 'finished'
export type QuestionState = 'show' | 'input' | 'judge' | 'correct' | 'wrong_soft' | 'wrong_final' | 'next'

export interface Question { ... }
export interface GameRun { ... }
export interface GameStats { ... }
export interface GameRunSummary { ... }

// 计算函数
export function generateId(): string
export function getComboMultiplier(combo: number): number
export function calculateQuestionScore(isCorrect, combo, isBoss, isSpeedStar): number
```

### question-generator.ts

```typescript
// 生成题目
export function generateQuestions(count: number, difficulty: Difficulty, bossCount?: number): Question[]

// 解析用户输入 (支持中文数字)
export function parseUserInput(input: string): number | null
```

### sounds.ts

```typescript
export function playCorrectSound(): void
export function playWrongSound(): void
export function playComboSound(comboLevel: number): void
export function playShieldSound(): void
export function playBossSound(): void
export function playSpeedStarSound(): void
export function playFinishSound(): void
```

### utils.ts

```typescript
export function cn(...inputs: ClassValue[]): string  // Tailwind class merge
```

---

## 🔢 题目生成逻辑

位置: `question-generator.ts`

```typescript
const DIFFICULTY_CONFIG: Record<Difficulty, QuestionTemplate[]> = {
  easy: [
    // 两位数加法
    { num1Range: [10, 99], num2Range: [1, 99], operations: ['+'] },
    // 两位数减法 (结果 ≥ 0)
    { num1Range: [10, 99], num2Range: [1, 50], operations: ['-'] },
    // 个位数加法
    { num1Range: [1, 9], num2Range: [1, 9], operations: ['+'] },
  ],
  medium: [
    // 三位数加法
    { num1Range: [100, 999], num2Range: [10, 999], operations: ['+'] },
    // 三位数减法
    { num1Range: [100, 999], num2Range: [10, 500], operations: ['-'] },
    // 乘法表
    { num1Range: [2, 12], num2Range: [2, 12], operations: ['*'] },
    // 两位数混合
    { num1Range: [10, 99], num2Range: [10, 99], operations: ['+', '-'] },
  ],
  hard: [
    // 大数乘法
    { num1Range: [2, 20], num2Range: [2, 20], operations: ['*'] },
    // 三位数混合
    { num1Range: [100, 999], num2Range: [100, 999], operations: ['+', '-'] },
    // 除法 (整除)
    { num1Range: [2, 12], num2Range: [2, 12], operations: ['/'] },
    // 复杂乘法
    { num1Range: [11, 25], num2Range: [2, 15], operations: ['*'] },
  ],
}
```

**扩展方法**: 在对应难度数组中添加新模板即可。

---

## 🔊 音效系统

位置: `sounds.ts`

使用 Web Audio API 动态生成音调，无需加载音频文件。

```typescript
function playTone(
  frequency: number,    // 频率 (Hz)
  duration: number,     // 时长 (秒)
  type: OscillatorType, // 波形: 'sine' | 'square' | 'triangle' | 'sawtooth'
  volume: number        // 音量: 0-1
): void
```

| 音效 | 实现 |
|------|------|
| 答对 | C5 → E5 上升双音 |
| 答错 | E4 → C4 下降双音 |
| 连击 | 根据 combo 级别增加音符 |
| 护盾 | A5 + 高频三角波 |
| 速度星 | C6 → E6 → G6 快速琶音 |
| 完成 | C5 → E5 → G5 → C6 胜利曲 |

---

## ⚠️ 技术债

| 问题 | 影响 | 解决方案 |
|------|------|----------|
| 音效无开关 | 无法静音 | 加全局开关 |
| 音效 AudioContext 懒加载 | 首次可能延迟 | 预热 |
| 中文数字解析有限 | 复杂中文数字不支持 | 扩展或使用库 |

---

## 🔗 依赖关系

```
lib/*
    ├── game-types.ts ──► 无外部依赖
    ├── question-generator.ts ──► game-types.ts
    ├── sounds.ts ──► Web Audio API (浏览器)
    └── utils.ts ──► clsx, tailwind-merge
```

---

## 📋 变更日志

| 日期 | 变更 | 文件 |
|------|------|------|
| 2026-01-31 | 初始实现 | 全部 |
| 2026-01-31 | 增加 GameRunSummary 类型 | game-types.ts |
| 2026-01-31 | 创建模块文档 | CLAUDE.md |

---

[PROTOCOL]: 变更时更新此文档，然后检查 /CLAUDE.md
