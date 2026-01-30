/**
 * ============================================================================
 * game-types.ts - 游戏类型定义与配置
 * ============================================================================
 *
 * [INPUT]: 无外部依赖
 * [OUTPUT]: GAME_CONFIG, GameMode, Difficulty, Question, GameRun, GameStats,
 *           generateId, getComboMultiplier, calculateQuestionScore
 * [POS]: lib 模块的核心类型定义，被 hooks/use-game.ts 和 components/game/* 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 lib/CLAUDE.md
 */

// ============================================================================
// 游戏配置常量
// ============================================================================

export const GAME_CONFIG = {
  questionsPerRunMain: 15,
  questionsPerRunQuick: 10,
  timeAttackSeconds: 120,
  softTimeLimitSec: 6,
  shieldPerRun: 1,
  retryPerQuestion: 1,
  bossCount: 1,
  bossMultiplier: 1.5,
  baseScore: 100,
  speedBonus: 20,
  comboThresholds: [2, 4, 6] as const,
  comboMultipliers: [1.0, 1.2, 1.5, 2.0] as const,
} as const

export type GameMode = 'main' | 'quick' | 'time_attack'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type QuestionResult = 'correct' | 'wrong' | 'skip' | 'pending'

export type RunState = 'idle' | 'ready' | 'playing' | 'paused' | 'finished'
export type QuestionState = 
  | 'show' 
  | 'input' 
  | 'judge' 
  | 'correct' 
  | 'wrong_soft' 
  | 'wrong_final' 
  | 'next'

export interface Question {
  index: number
  expression: string
  answer: number
  isBoss: boolean
  attempts: number
  result: QuestionResult
  userValue: number | null
  latencyMs: number
  comboBefore: number
  comboAfter: number
  speedStarGained: boolean
  shieldUsed: boolean
  retryUsed: boolean
}

export interface GameRun {
  runId: string
  mode: GameMode
  difficulty: Difficulty
  questionsPlanned: number
  questionsAnswered: number
  startAt: number
  endAt: number
  score: number
  accuracy: number
  maxCombo: number
  speedStars: number
  shieldUsed: number
  shieldRemaining: number
  currentCombo: number
  questions: Question[]
  currentQuestionIndex: number
  runState: RunState
  questionState: QuestionState
  timeRemaining: number // For time attack mode
}

export interface GameStats {
  totalScore: number
  correctCount: number
  wrongCount: number
  accuracy: number
  maxCombo: number
  speedStars: number
  shieldUsed: number
  averageTime: number
  wrongQuestions: Question[]
}

// Helper to generate unique IDs
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15)
}

// Get combo multiplier based on current combo
export function getComboMultiplier(combo: number): number {
  const { comboThresholds, comboMultipliers } = GAME_CONFIG
  if (combo < comboThresholds[0]) return comboMultipliers[0]
  if (combo < comboThresholds[1]) return comboMultipliers[1]
  if (combo < comboThresholds[2]) return comboMultipliers[2]
  return comboMultipliers[3]
}

// Calculate score for a single question
export function calculateQuestionScore(
  isCorrect: boolean,
  combo: number,
  isBoss: boolean,
  isSpeedStar: boolean
): number {
  if (!isCorrect) return 0
  
  const { baseScore, bossMultiplier, speedBonus } = GAME_CONFIG
  const comboMult = getComboMultiplier(combo)
  const bossMult = isBoss ? bossMultiplier : 1.0
  const speed = isSpeedStar ? speedBonus : 0
  
  return Math.round(baseScore * comboMult * bossMult + speed)
}
