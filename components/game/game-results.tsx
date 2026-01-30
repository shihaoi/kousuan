'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { GameStats, GameRun } from '@/lib/game-types'
import { Trophy, Target, Flame, Star, Shield, Clock, RotateCcw, Home, CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface GameResultsProps {
  game: GameRun
  stats: GameStats
  onPlayAgain: () => void
  onHome: () => void
}

// 数字递增动画
function CountUp({ end, duration = 1000, className }: { end: number; duration?: number; className?: string }) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    let startTime: number
    let animationFrame: number
    
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }
    
    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])
  
  return <span className={className}>{count}</span>
}

// 彩带粒子
function Confetti() {
  const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7']
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3"
          style={{
            left: `${Math.random() * 100}%`,
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
          initial={{ 
            y: -20, 
            opacity: 1,
            rotate: 0,
            scale: Math.random() * 0.5 + 0.5
          }}
          animate={{ 
            y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
            opacity: 0,
            rotate: Math.random() * 720 - 360,
            x: (Math.random() - 0.5) * 200
          }}
          transition={{ 
            duration: 2 + Math.random() * 2,
            delay: Math.random() * 0.5,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

export function GameResults({ game, stats, onPlayAgain, onHome }: GameResultsProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const timeTaken = game.endAt - game.startAt
  const minutes = Math.floor(timeTaken / 60000)
  const seconds = Math.floor((timeTaken % 60000) / 1000)
  
  // Determine performance rating
  const getPerformanceRating = () => {
    if (stats.accuracy >= 90 && stats.maxCombo >= 5) return { label: '太棒了！', color: 'text-success', showConfetti: true }
    if (stats.accuracy >= 80) return { label: '做得很好！', color: 'text-primary', showConfetti: true }
    if (stats.accuracy >= 60) return { label: '继续努力！', color: 'text-warning', showConfetti: false }
    return { label: '多加练习！', color: 'text-muted-foreground', showConfetti: false }
  }
  
  const rating = getPerformanceRating()
  
  // 显示彩带
  useEffect(() => {
    if (rating.showConfetti) {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [rating.showConfetti])
  
  // 动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {showConfetti && <Confetti />}
      
      <motion.div 
        className="w-full max-w-md space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header - 带入场动画 */}
        <motion.div className="text-center space-y-2" variants={itemVariants}>
          <motion.div 
            className="flex items-center justify-center"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
            >
              <Trophy className="h-12 w-12 text-primary" />
            </motion.div>
          </motion.div>
          <motion.h1 
            className="text-3xl font-bold tracking-tight text-foreground"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            游戏结束！
          </motion.h1>
          <motion.p 
            className={cn("text-xl font-semibold flex items-center justify-center gap-2", rating.color)}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.4 }}
          >
            {rating.showConfetti && <Sparkles className="w-5 h-5" />}
            {rating.label}
            {rating.showConfetti && <Sparkles className="w-5 h-5" />}
          </motion.p>
        </motion.div>
        
        {/* Main Score Card - 分数递增动画 */}
        <motion.div variants={itemVariants}>
          <Card className="border-primary/20 overflow-hidden">
            <CardContent className="pt-6 relative">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <div className="text-center relative">
                <div className="text-5xl font-bold font-mono text-primary">
                  <CountUp end={stats.totalScore} duration={1500} />
                </div>
                <div className="text-muted-foreground mt-1">总得分</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Stats Grid - 交错入场 */}
        <motion.div className="grid grid-cols-2 gap-3" variants={itemVariants}>
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div 
                  className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <Target className="h-5 w-5 text-success" />
                </motion.div>
                <div>
                  <div className="text-xl font-bold text-foreground">
                    <CountUp end={Math.round(stats.accuracy)} duration={1200} />%
                  </div>
                  <div className="text-xs text-muted-foreground">正确率</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div 
                  className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                >
                  <Flame className="h-5 w-5 text-destructive" />
                </motion.div>
                <div>
                  <div className="text-xl font-bold text-foreground">
                    <CountUp end={stats.maxCombo} duration={800} />
                  </div>
                  <div className="text-xs text-muted-foreground">最高连击</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div 
                  className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.7, type: "spring" }}
                >
                  <Star className="h-5 w-5 text-warning fill-warning" />
                </motion.div>
                <div>
                  <div className="text-xl font-bold text-foreground">
                    <CountUp end={stats.speedStars} duration={800} />
                  </div>
                  <div className="text-xs text-muted-foreground">速度星</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring" }}>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <motion.div 
                  className="h-10 w-10 rounded-lg bg-shield/10 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8, type: "spring" }}
                >
                  <Shield className="h-5 w-5 text-shield" />
                </motion.div>
                <div>
                  <div className="text-xl font-bold text-foreground">{stats.shieldUsed}</div>
                  <div className="text-xs text-muted-foreground">使用护盾</div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
        
        {/* Additional Stats */}
        <motion.div variants={itemVariants}>
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
        </motion.div>
        
        {/* Wrong Questions Review */}
        {stats.wrongQuestions.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">错题回顾</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.wrongQuestions.slice(0, 5).map((q, i) => (
                  <motion.div 
                    key={i}
                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                  >
                    <span className="font-mono text-foreground">{q.expression}</span>
                    <div className="flex items-center gap-2">
                      {q.userValue !== null && (
                        <span className="text-destructive line-through">{q.userValue}</span>
                      )}
                      <span className="font-semibold text-success">{q.answer}</span>
                    </div>
                  </motion.div>
                ))}
                {stats.wrongQuestions.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center">
                    还有 {stats.wrongQuestions.length - 5} 题
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {/* Action Buttons - 带动效 */}
        <motion.div className="flex gap-3" variants={itemVariants}>
          <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              variant="outline" 
              className="w-full h-12 bg-transparent"
              onClick={onHome}
            >
              <Home className="h-4 w-4 mr-2" />
              主页
            </Button>
          </motion.div>
          <motion.div 
            className="flex-1" 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Button 
              className="w-full h-12"
              onClick={onPlayAgain}
            >
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
              </motion.div>
              再玩一次
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}
