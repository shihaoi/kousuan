'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GameStats, GameRun } from '@/lib/game-types'
import { Trophy, Target, Flame, Star, Shield, Clock, RotateCcw, Home, CheckCircle2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameResultsProps {
  game: GameRun
  stats: GameStats
  onPlayAgain: () => void
  onHome: () => void
}

export function GameResults({ game, stats, onPlayAgain, onHome }: GameResultsProps) {
  const timeTaken = game.endAt - game.startAt
  const minutes = Math.floor(timeTaken / 60000)
  const seconds = Math.floor((timeTaken % 60000) / 1000)
  
  // Determine performance rating
  const getPerformanceRating = () => {
    if (stats.accuracy >= 90 && stats.maxCombo >= 5) return { label: '太棒了！', color: 'text-success' }
    if (stats.accuracy >= 80) return { label: '做得很好！', color: 'text-primary' }
    if (stats.accuracy >= 60) return { label: '继续努力！', color: 'text-warning' }
    return { label: '多加练习！', color: 'text-muted-foreground' }
  }
  
  const rating = getPerformanceRating()
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <Trophy className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">游戏结束！</h1>
          <p className={cn("text-xl font-semibold", rating.color)}>{rating.label}</p>
        </div>
        
        {/* Main Score Card */}
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-5xl font-bold font-mono text-primary">{stats.totalScore}</div>
              <div className="text-muted-foreground mt-1">总得分</div>
            </div>
          </CardContent>
        </Card>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-success" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats.accuracy.toFixed(0)}%</div>
                <div className="text-xs text-muted-foreground">正确率</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats.maxCombo}</div>
                <div className="text-xs text-muted-foreground">最高连击</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-warning" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats.speedStars}</div>
                <div className="text-xs text-muted-foreground">速度星</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-shield/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-shield" />
              </div>
              <div>
                <div className="text-xl font-bold text-foreground">{stats.shieldUsed}</div>
                <div className="text-xs text-muted-foreground">使用护盾</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Additional Stats */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">用时</span>
              </div>
              <span className="font-mono font-semibold text-foreground">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm">答对</span>
              </div>
              <span className="font-mono font-semibold text-success">{stats.correctCount}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm">答错</span>
              </div>
              <span className="font-mono font-semibold text-destructive">{stats.wrongCount}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Wrong Questions Review */}
        {stats.wrongQuestions.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">错题回顾</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stats.wrongQuestions.slice(0, 5).map((q, i) => (
                <div 
                  key={i}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                >
                  <span className="font-mono text-foreground">{q.expression}</span>
                  <div className="flex items-center gap-2">
                    {q.userValue !== null && (
                      <span className="text-destructive line-through">{q.userValue}</span>
                    )}
                    <span className="font-semibold text-success">{q.answer}</span>
                  </div>
                </div>
              ))}
              {stats.wrongQuestions.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  还有 {stats.wrongQuestions.length - 5} 题
                </p>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="flex-1 h-12 bg-transparent"
            onClick={onHome}
          >
            <Home className="h-4 w-4 mr-2" />
            主页
          </Button>
          <Button 
            className="flex-1 h-12"
            onClick={onPlayAgain}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            再玩一次
          </Button>
        </div>
      </div>
    </div>
  )
}
