'use client'

import React from "react"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Question, QuestionState, GameRun } from '@/lib/game-types'
import { GAME_CONFIG, getComboMultiplier, calculateQuestionScore } from '@/lib/game-types'
import { Crown, Zap, Shield, RotateCcw, ArrowRight, Check, X, Star, Flame, Sparkles } from 'lucide-react'

interface QuestionCardProps {
  question: Question
  questionState: QuestionState
  game: GameRun
  onSubmit: (answer: string) => void
  onNext: () => void
  onRetry: () => void
  onStartInput: () => void
}

// ============================================
// 动画组件
// ============================================

// 答对动画
function CorrectAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 中心对勾 */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-2xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
            >
              <Check className="w-14 h-14 text-white stroke-3" />
            </motion.div>
          </motion.div>

          {/* 放射粒子 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-success"
              initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
              animate={{ 
                x: Math.cos((i * Math.PI * 2) / 8) * 120,
                y: Math.sin((i * Math.PI * 2) / 8) * 120,
                scale: 0,
                opacity: 0
              }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 连击动画
function ComboAnimation({ combo, show }: { combo: number; show: boolean }) {
  if (!show || combo < 2) return null

  const getComboColor = () => {
    if (combo >= 6) return 'text-red-500'
    if (combo >= 4) return 'text-orange-500'
    return 'text-yellow-500'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
          style={{ top: '60%' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`font-bold text-4xl ${getComboColor()} flex items-center gap-2`}
            initial={{ scale: 0, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <motion.div
              animate={{ rotate: [0, -15, 15, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Flame className="w-10 h-10 fill-current" />
            </motion.div>
            <span>{combo}连击!</span>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <Flame className="w-10 h-10 fill-current" />
            </motion.div>
          </motion.div>

          {/* 火星粒子 (高连击时) */}
          {combo >= 4 && [...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-orange-400"
              style={{ top: '50%' }}
              initial={{ x: (Math.random() - 0.5) * 50, y: 0, opacity: 1 }}
              animate={{ 
                y: -100 - Math.random() * 80,
                x: (Math.random() - 0.5) * 150,
                opacity: 0,
                scale: [1, 0]
              }}
              transition={{ duration: 0.6 + Math.random() * 0.3, ease: "easeOut" }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 速度星动画
function SpeedStarAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed pointer-events-none z-40 flex items-center justify-center"
          style={{ top: '25%', left: '50%', transform: 'translateX(-50%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="flex items-center gap-2 text-warning"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.2, 1] }}
              transition={{ rotate: { duration: 0.5, ease: "linear" }, scale: { duration: 0.25, repeat: 2, ease: "easeOut" } }}
            >
              <Star className="w-12 h-12 fill-warning text-warning" />
            </motion.div>
            <span className="text-2xl font-bold">快!</span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 分数弹出动画
function ScorePopAnimation({ score, show }: { score: number; show: boolean }) {
  if (!show || score === 0) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed pointer-events-none z-30 font-bold text-3xl text-primary"
          style={{ top: '35%', left: '50%', transform: 'translateX(-50%)' }}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ y: -60, opacity: 0, scale: 1.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          +{score}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// 护盾动画
function ShieldActiveAnimation({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-48 h-48 rounded-full border-4 border-shield flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          >
            <motion.div
              className="text-shield text-2xl font-bold flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-6 h-6" />
              护盾保护!
            </motion.div>
          </motion.div>
          
          {/* 波纹效果 */}
          <motion.div
            className="absolute w-48 h-48 rounded-full border-2 border-shield/50"
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function QuestionCard({
  question,
  questionState,
  game,
  onSubmit,
  onNext,
  onRetry,
  onStartInput,
}: QuestionCardProps) {
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [showWrongAnimation, setShowWrongAnimation] = useState(false)
  
  // 动画状态
  const [showCorrectAnim, setShowCorrectAnim] = useState(false)
  const [showComboAnim, setShowComboAnim] = useState(false)
  const [showSpeedStarAnim, setShowSpeedStarAnim] = useState(false)
  const [showScoreAnim, setShowScoreAnim] = useState(false)
  const [showShieldAnim, setShowShieldAnim] = useState(false)
  const [animScore, setAnimScore] = useState(0)
  const [animCombo, setAnimCombo] = useState(0)
  
  // 追踪上一个问题索引，用于检测答对后的切换
  const prevQuestionIndex = useRef(question.index)
  const prevScore = useRef(game.score)
  const prevCombo = useRef(game.currentCombo)
  const prevSpeedStars = useRef(game.speedStars)
  
  // Focus input when entering input state
  useEffect(() => {
    if (questionState === 'input' && inputRef.current) {
      inputRef.current.focus()
    }
  }, [questionState])
  
  // Auto-transition from show to input immediately
  useEffect(() => {
    if (questionState === 'show') {
      setInputValue('')
      onStartInput()
    }
  }, [questionState, onStartInput])
  
  // 检测答对 - 通过问题索引变化和分数增加来判断
  useEffect(() => {
    const questionChanged = question.index !== prevQuestionIndex.current
    const scoreIncreased = game.score > prevScore.current
    const comboIncreased = game.currentCombo > prevCombo.current
    const speedStarGained = game.speedStars > prevSpeedStars.current
    
    // 如果问题变了且分数增加了，说明上一题答对了
    if (questionChanged && scoreIncreased) {
      const earnedScore = game.score - prevScore.current
      const newCombo = game.currentCombo
      
      // 触发答对动画
      setAnimScore(earnedScore)
      setAnimCombo(newCombo)
      setShowCorrectAnim(true)
      setShowScoreAnim(true)
      
      // 连击动画
      if (newCombo >= 2) {
        setTimeout(() => setShowComboAnim(true), 200)
      }
      
      // 速度星动画
      if (speedStarGained) {
        setTimeout(() => setShowSpeedStarAnim(true), 100)
      }
      
      // 清除动画
      setTimeout(() => {
        setShowCorrectAnim(false)
        setShowScoreAnim(false)
        setShowComboAnim(false)
        setShowSpeedStarAnim(false)
      }, 800)
    }
    
    // 更新 refs
    prevQuestionIndex.current = question.index
    prevScore.current = game.score
    prevCombo.current = game.currentCombo
    prevSpeedStars.current = game.speedStars
  }, [question.index, game.score, game.currentCombo, game.speedStars])
  
  // 检测护盾激活
  useEffect(() => {
    if (questionState === 'wrong_soft' && question.shieldUsed) {
      setShowShieldAnim(true)
      setTimeout(() => setShowShieldAnim(false), 1000)
    }
  }, [questionState, question.shieldUsed])
  
  // Trigger wrong animation on state changes
  useEffect(() => {
    if (questionState === 'wrong_final' || questionState === 'wrong_soft') {
      setShowWrongAnimation(true)
      const timer = setTimeout(() => setShowWrongAnimation(false), 400)
      return () => clearTimeout(timer)
    }
  }, [questionState])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && questionState === 'input') {
      onSubmit(inputValue)
    }
  }
  
  const handleKeypadPress = (key: string) => {
    if (key === 'clear') {
      setInputValue('')
    } else if (key === 'back') {
      setInputValue(prev => prev.slice(0, -1))
    } else if (key === 'submit') {
      if (inputValue.trim()) {
        onSubmit(inputValue)
      }
    } else if (key === '-') {
      // Only allow negative at the start
      if (inputValue === '') {
        setInputValue('-')
      }
    } else {
      setInputValue(prev => prev + key)
    }
  }
  
  const isCorrect = questionState === 'correct'
  const isWrongSoft = questionState === 'wrong_soft'
  const isWrongFinal = questionState === 'wrong_final'
  const comboMultiplier = getComboMultiplier(game.currentCombo)
  
  const showKeypad = questionState === 'input' || questionState === 'show'
  const showActions = isWrongSoft || isWrongFinal
  
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto h-full">
      {/* 动画层 */}
      <CorrectAnimation show={showCorrectAnim} />
      <ComboAnimation combo={animCombo} show={showComboAnim} />
      <SpeedStarAnimation show={showSpeedStarAnim} />
      <ScorePopAnimation score={animScore} show={showScoreAnim} />
      <ShieldActiveAnimation show={showShieldAnim} />
      
      {/* Question Display - 带切换动画 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.index}
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          <motion.div
            animate={showWrongAnimation ? { x: [0, -8, 8, -8, 8, 0] } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className={cn(
              "relative overflow-hidden transition-all duration-200",
              showWrongAnimation && isWrongSoft && "ring-4 ring-warning",
              showWrongAnimation && isWrongFinal && "ring-4 ring-destructive",
              question.isBoss && "ring-2 ring-boss"
            )}>
              {/* Boss Badge */}
              {question.isBoss && (
                <motion.div 
                  className="absolute top-2 right-2 flex items-center gap-1 bg-boss text-boss-foreground px-2 py-1 rounded-full text-xs font-semibold"
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <Crown className="h-3 w-3" />
                  关卡 x1.5
                </motion.div>
              )}
              
              <CardContent className="p-6">
                {/* Progress indicator */}
                <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
                  <span>第 {question.index + 1}/{game.questionsPlanned} 题</span>
                  {game.mode === 'time_attack' && (
                    <motion.span 
                      className={cn(
                        "font-mono",
                        game.timeRemaining <= 10 && "text-destructive font-bold"
                      )}
                      animate={game.timeRemaining <= 10 ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {Math.floor(game.timeRemaining / 60)}:{(game.timeRemaining % 60).toString().padStart(2, '0')}
                    </motion.span>
                  )}
                </div>
                
                {/* Expression - 带入场动画 */}
                <motion.div
                  className="text-center py-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <div className="text-4xl md:text-5xl font-bold font-mono text-foreground tracking-wider">
                    {question.expression} = ?
                  </div>
                </motion.div>
                
                {/* Feedback Messages */}
                <AnimatePresence>
                  {isWrongSoft && question.shieldUsed && (
                    <motion.div 
                      className="flex items-center justify-center gap-2 text-shield font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <Shield className="h-5 w-5" />
                      <span>护盾已激活！答案：{question.answer}</span>
                    </motion.div>
                  )}
                  
                  {isWrongSoft && !question.shieldUsed && (
                    <motion.div 
                      className="flex items-center justify-center gap-2 text-warning font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <RotateCcw className="h-5 w-5" />
                      </motion.div>
                      <span>再试一次！</span>
                    </motion.div>
                  )}
                  
                  {isWrongFinal && (
                    <motion.div 
                      className="flex items-center justify-center gap-2 text-destructive font-semibold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <X className="h-5 w-5" />
                      <span>答错了。正确答案：{question.answer}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </AnimatePresence>
      
      {/* Input Area - Always visible for fixed layout */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* 输入框带数字变化动画 */}
        <motion.div
          key={inputValue}
          initial={inputValue ? { scale: 1.02 } : {}}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
        >
          <Input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            pattern="-?[0-9]*"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入你的答案"
            className="text-center text-2xl font-mono h-14"
            autoComplete="off"
            disabled={!showKeypad}
          />
        </motion.div>
        
        {/* Number Keypad - 带按压动画 */}
        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9', 'back'].map((key) => (
            <motion.div key={key} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
              <Button
                type="button"
                variant={key === 'back' ? 'outline' : 'secondary'}
                className="h-12 text-lg font-semibold w-full"
                onClick={() => handleKeypadPress(key)}
                disabled={!showKeypad}
              >
                {key === 'back' ? '←' : key}
              </Button>
            </motion.div>
          ))}
          {['4', '5', '6', 'clear'].map((key) => (
            <motion.div key={key} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
              <Button
                type="button"
                variant={key === 'clear' ? 'outline' : 'secondary'}
                className="h-12 text-lg font-semibold w-full"
                onClick={() => handleKeypadPress(key)}
                disabled={!showKeypad}
              >
                {key === 'clear' ? 'C' : key}
              </Button>
            </motion.div>
          ))}
          {['1', '2', '3', 'submit'].map((key) => (
            <motion.div key={key} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
              <Button
                type={key === 'submit' ? 'submit' : 'button'}
                variant={key === 'submit' ? 'default' : 'secondary'}
                className={cn(
                  "h-12 text-lg font-semibold w-full",
                  key === 'submit' && "bg-primary text-primary-foreground"
                )}
                onClick={() => key !== 'submit' && handleKeypadPress(key)}
                disabled={!showKeypad}
              >
                {key === 'submit' ? '↵' : key}
              </Button>
            </motion.div>
          ))}
          {['-', '0', '00'].map((key) => (
            <motion.div key={key} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.02 }}>
              <Button
                type="button"
                variant="secondary"
                className="h-12 text-lg font-semibold w-full"
                onClick={() => handleKeypadPress(key)}
                disabled={!showKeypad}
              >
                {key}
              </Button>
            </motion.div>
          ))}
        </div>
      </form>
      
      {/* Action Buttons - 带入场动画 */}
      <AnimatePresence>
        {isWrongSoft && !question.shieldUsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button onClick={onRetry} className="w-full h-12">
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                </motion.div>
                再试一次
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {(isWrongFinal || (isWrongSoft && question.shieldUsed)) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button onClick={onNext} className="w-full h-12">
                下一题
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
