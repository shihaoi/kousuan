/**
 * ============================================================================
 * game-start.tsx - 开始页与模式选择
 * ============================================================================
 *
 * [INPUT]: hooks/use-game (startGame + history), lib/game-types (类型),
 *          components/ui/* (设计系统组件)
 * [OUTPUT]: GameStart 组件
 * [POS]: components/game 的开始页 UI，被 game-container.tsx 消费
 * [PROTOCOL]: 变更时更新此头部，然后检查 components/game/CLAUDE.md
 */
'use client'

import React from "react"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { GameMode, Difficulty, GameRunSummary } from '@/lib/game-types'
import { Zap, Clock, Target, Brain, Flame, Shield } from 'lucide-react'

interface GameStartProps {
  onStart: (mode: GameMode, difficulty: Difficulty) => void
  history: GameRunSummary[]
  onClearHistory: () => void
}

const MODES: { value: GameMode; label: string; description: string; icon: React.ReactNode; questions: string }[] = [
  { 
    value: 'main', 
    label: '标准模式', 
    description: '完成15道题目，体验完整功能',
    icon: <Target className="h-5 w-5" />,
    questions: '15题'
  },
  { 
    value: 'quick', 
    label: '快速模式', 
    description: '快节奏的10道题挑战',
    icon: <Zap className="h-5 w-5" />,
    questions: '10题'
  },
  { 
    value: 'time_attack', 
    label: '限时挑战', 
    description: '2分钟内尽可能多答题',
    icon: <Clock className="h-5 w-5" />,
    questions: '2分钟'
  },
]

const DIFFICULTIES: { value: Difficulty; label: string; description: string; color: string }[] = [
  { 
    value: 'easy', 
    label: '简单', 
    description: '两位数加减法',
    color: 'bg-success/10 text-success border-success/30 hover:bg-success/20'
  },
  { 
    value: 'medium', 
    label: '中等', 
    description: '三位数运算和乘法',
    color: 'bg-warning/10 text-warning-foreground border-warning/30 hover:bg-warning/20'
  },
  { 
    value: 'hard', 
    label: '困难', 
    description: '复杂乘除法',
    color: 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/20'
  },
]

const getModeLabel = (mode: GameMode) => {
  return MODES.find((item) => item.value === mode)?.label ?? '未知模式'
}

const getDifficultyLabel = (difficulty: Difficulty) => {
  return DIFFICULTIES.find((item) => item.value === difficulty)?.label ?? '未知难度'
}

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function GameStart({ onStart, history, onClearHistory }: GameStartProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('main')
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy')
  const recentHistory = history.slice(0, 5)
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">口算题卡</h1>
          <p className="text-muted-foreground">通过快速计算锻炼大脑</p>
        </div>
        
        {/* Game Features */}
        <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-destructive" />
            <span>连击</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-shield" />
            <span>护盾</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-warning" />
            <span>速度星</span>
          </div>
        </div>
        
        {/* Mode Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">选择模式</CardTitle>
            <CardDescription>选择你的游戏风格</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {MODES.map((mode) => (
              <button
                key={mode.value}
                onClick={() => setSelectedMode(mode.value)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left",
                  selectedMode === mode.value
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center h-10 w-10 rounded-lg",
                  selectedMode === mode.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                )}>
                  {mode.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{mode.label}</div>
                  <div className="text-sm text-muted-foreground">{mode.description}</div>
                </div>
                <div className="text-sm font-medium text-primary">{mode.questions}</div>
              </button>
            ))}
          </CardContent>
        </Card>
        
        {/* Difficulty Selection */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">选择难度</CardTitle>
            <CardDescription>匹配你的能力水平</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff.value}
                onClick={() => setSelectedDifficulty(diff.value)}
                className={cn(
                  "flex-1 p-3 rounded-lg border-2 transition-all text-center",
                  selectedDifficulty === diff.value
                    ? diff.color + " border-current"
                    : "border-border hover:bg-muted/50"
                )}
              >
                <div className="font-semibold">{diff.label}</div>
                <div className="text-xs mt-1 opacity-80">{diff.description}</div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Recent History */}
        {history.length > 0 && (
          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-lg">最近成绩</CardTitle>
              <Button variant="ghost" size="sm" className="text-xs" onClick={onClearHistory}>
                清空
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentHistory.map((item) => (
                <div
                  key={item.runId}
                  className="flex items-center justify-between rounded-lg border border-border/60 p-2 text-sm"
                >
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {getModeLabel(item.mode)} · {getDifficultyLabel(item.difficulty)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(item.completedAt).toLocaleString('zh-CN', {
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="font-mono font-semibold text-primary">{item.score}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.round(item.accuracy)}% · {formatDuration(item.timeTakenMs)}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* Start Button */}
        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold"
          onClick={() => onStart(selectedMode, selectedDifficulty)}
        >
          开始游戏
        </Button>
      </div>
    </div>
  )
}
