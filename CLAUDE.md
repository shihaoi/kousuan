# 口算题卡 - 项目宪法 (L1)

> 最后更新: 2026-01-31
> 维护者: @ash

---

## 🎯 项目定位

儿童口算练习游戏化应用。通过连击、护盾、速度星等游戏机制，让数学练习更有趣。

**目标用户**: 小学 1-6 年级学生
**核心价值**: 游戏化 + 即时反馈 + 零配置即用

---

## 🏗️ 技术栈

| 层级 | 技术选型 | 版本 | 选型理由 |
|------|----------|------|----------|
| 框架 | Next.js (App Router) | 16.x | SSG 为主，零后端依赖 |
| 语言 | TypeScript | 5.x | 类型安全 |
| 样式 | Tailwind CSS | 4.x | 原子化 + Design Tokens |
| 组件 | shadcn/ui + Radix | - | 无障碍 + 可定制 |
| 动画 | Framer Motion | 12.x | 声明式动画 |
| 音效 | Web Audio API | - | 零依赖，即时生成 |

---

## 📁 目录结构

```
口算题卡yz/
├── app/                        # Next.js App Router
│   ├── globals.css             # 全局样式 + CSS 变量 (Design Tokens)
│   ├── layout.tsx              # 根布局 (元数据/字体)
│   └── page.tsx                # 首页入口 → GameContainer
│
├── components/
│   ├── game/                   # 🎮 游戏核心 (见 components/game/CLAUDE.md)
│   │   ├── game-container.tsx  # 状态路由器
│   │   ├── game-start.tsx      # 模式/难度选择
│   │   ├── game-hud.tsx        # 顶部状态栏
│   │   ├── question-card.tsx   # 答题卡片 + 动画
│   │   ├── game-results.tsx    # 结果统计
│   │   └── animations.tsx      # 可复用动画组件
│   │
│   ├── ui/                     # shadcn/ui 组件库
│   └── theme-provider.tsx      # 主题切换
│
├── hooks/
│   └── use-game.ts             # 🎯 核心状态机 (见 hooks/CLAUDE.md)
│
├── lib/
│   ├── game-types.ts           # 类型定义 + 游戏配置常量
│   ├── question-generator.ts   # 题目生成器
│   ├── sounds.ts               # 音效系统
│   └── utils.ts                # 工具函数
│
├── public/                     # 静态资源
├── styles/                     # 备用样式
├── CLAUDE.md                   # L1 项目宪法 (本文件)
├── README.md                   # 用户文档
└── LICENSE                     # MIT
```

---

## 🔺 关键边界

### 渲染策略

| 页面 | 策略 | 理由 |
|------|------|------|
| `/` | SSG | 纯静态，无服务端数据 |

### Server / Client 边界

```
┌─────────────────────────────────────────────────────────┐
│ SERVER SIDE (Build Time)                                │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ app/layout.tsx - 元数据/字体                        │ │
│ │ app/page.tsx   - 静态壳                             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ CLIENT SIDE (Runtime)                                   │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ components/game/* - 全部 "use client"               │ │
│ │ hooks/use-game.ts - 游戏状态机                      │ │
│ │ lib/sounds.ts     - Web Audio API                   │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ 理由: 游戏需要实时交互/状态/浏览器 API (音频)          │
│ 代价: 首屏 JS Bundle 较大 (~150KB gzipped)             │
│ 优化: 已用 dynamic import 延迟非关键动画               │
└─────────────────────────────────────────────────────────┘
```

### 数据流

```
用户选择模式/难度
       ↓
   startGame()
       ↓
generateQuestions() → 生成题目数组
       ↓
  GameRun 状态初始化
       ↓
┌──────────────────────────────────────┐
│ 游戏循环                              │
│   show → input → judge               │
│         ↓                            │
│   correct / wrong_soft / wrong_final │
│         ↓                            │
│   分数/连击/护盾 状态更新             │
│         ↓                            │
│   动画触发 + 音效播放                 │
│         ↓                            │
│   自动进入下一题 或 显示操作按钮      │
└──────────────────────────────────────┘
       ↓
  runState: 'finished'
       ↓
  GameResults 展示统计
```

---

## ⚙️ 游戏配置 (可调参数)

位置: `lib/game-types.ts` → `GAME_CONFIG`

| 参数 | 默认值 | 说明 |
|------|--------|------|
| questionsPerRunMain | 15 | 标准模式题数 |
| questionsPerRunQuick | 10 | 快速模式题数 |
| timeAttackSeconds | 120 | 限时模式时长 |
| softTimeLimitSec | 6 | 速度星阈值 (秒) |
| shieldPerRun | 1 | 每局护盾数 |
| retryPerQuestion | 1 | 每题重试次数 |
| baseScore | 100 | 基础分数 |
| speedBonus | 20 | 速度星加分 |
| comboThresholds | [2,4,6] | 连击倍率阈值 |
| comboMultipliers | [1.0,1.2,1.5,2.0] | 对应倍率 |

---

## 🚨 已知限制 & 技术债

| 问题 | 影响 | 优先级 | 解决方案 |
|------|------|--------|----------|
| 无数据持久化 | 刷新丢失进度/历史 | P1 | 加 localStorage 或 DB |
| 无 Auth | 无法记录用户成绩 | P2 | 加 Supabase Auth |
| 无错误边界 | 崩溃白屏 | P1 | 加 ErrorBoundary + 上报 |
| 无可观测性 | 无法追踪问题 | P2 | 加日志 + Sentry |
| 无测试 | 重构风险 | P2 | 加 Vitest 单测 |
| Bundle 较大 | 首屏略慢 | P3 | 按需 dynamic import |

---

## 📋 变更日志

| 日期 | 变更 | 影响范围 |
|------|------|----------|
| 2026-01-31 | 初始化项目 | 全部 |
| 2026-01-31 | 添加 Framer Motion 动画 | components/game/* |
| 2026-01-31 | 中文化 | 全部 UI 文本 |
| 2026-01-31 | 创建 GEB 文档体系 | CLAUDE.md |

---

## 🔗 子模块文档

- [components/game/CLAUDE.md](./components/game/CLAUDE.md) - 游戏核心组件
- [hooks/CLAUDE.md](./hooks/CLAUDE.md) - 状态管理
- [lib/CLAUDE.md](./lib/CLAUDE.md) - 核心逻辑库

---

[PROTOCOL]: 任何架构变更必须同步更新本文件
