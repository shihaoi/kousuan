/**
 * ============================================================================
 * use-game.ts - 游戏状态机 Hook
 * ============================================================================
 *
 * [INPUT]: lib/game-types (类型+配置), lib/question-generator (题目生成),
 *          lib/sounds (音效播放)
 * [OUTPUT]: useGame() hook - 返回游戏状态和操作方法
 * [POS]: hooks 模块的核心，被 components/game/game-container.tsx 消费
 *        管理完整游戏生命周期：开始→答题→判定→结束
 * [PROTOCOL]: 变更时更新此头部，然后检查 hooks/CLAUDE.md
 */

'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
  type GameRun,
  type GameMode,
  type Difficulty,
  type GameStats,
  type QuestionState,
  GAME_CONFIG,
  generateId,
  calculateQuestionScore,
} from '@/lib/game-types'
import { generateQuestions, parseUserInput } from '@/lib/question-generator'
import {
  playCorrectSound,
  playWrongSound,
  playComboSound,
  playShieldSound,
  playSpeedStarSound,
  playFinishSound,
} from '@/lib/sounds'

// ============================================================================
// 游戏状态机 Hook
// ============================================================================

export function useGame() {
  const [game, setGame] = useState<GameRun | null>(null)
  const questionStartTime = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Initialize a new game
  const startGame = useCallback((mode: GameMode, difficulty: Difficulty) => {
    const questionsCount = mode === 'main' 
      ? GAME_CONFIG.questionsPerRunMain 
      : mode === 'quick'
        ? GAME_CONFIG.questionsPerRunQuick
        : 50 // Time attack can have many questions
    
    const questions = generateQuestions(questionsCount, difficulty, GAME_CONFIG.bossCount)
    
    const newGame: GameRun = {
      runId: generateId(),
      mode,
      difficulty,
      questionsPlanned: questionsCount,
      questionsAnswered: 0,
      startAt: Date.now(),
      endAt: 0,
      score: 0,
      accuracy: 0,
      maxCombo: 0,
      speedStars: 0,
      shieldUsed: 0,
      shieldRemaining: GAME_CONFIG.shieldPerRun,
      currentCombo: 0,
      questions,
      currentQuestionIndex: 0,
      runState: 'playing',
      questionState: 'show',
      timeRemaining: mode === 'time_attack' ? GAME_CONFIG.timeAttackSeconds : 0,
    }
    
    setGame(newGame)
    questionStartTime.current = Date.now()
    
    // Start timer for time attack mode
    if (mode === 'time_attack') {
      timerRef.current = setInterval(() => {
        setGame(prev => {
          if (!prev || prev.runState !== 'playing') return prev
          const newTime = prev.timeRemaining - 1
          if (newTime <= 0) {
            if (timerRef.current) clearInterval(timerRef.current)
            return { ...prev, timeRemaining: 0, runState: 'finished', endAt: Date.now() }
          }
          return { ...prev, timeRemaining: newTime }
        })
      }, 1000)
    }
  }, [])
  
  // Submit answer for current question
  const submitAnswer = useCallback((input: string) => {
    if (!game || game.runState !== 'playing') return
    
    const currentQ = game.questions[game.currentQuestionIndex]
    if (!currentQ) return
    
    const userValue = parseUserInput(input)
    const latency = Date.now() - questionStartTime.current
    const isWithinTimeLimit = latency <= GAME_CONFIG.softTimeLimitSec * 1000
    
    const isCorrect = userValue === currentQ.answer
    const newAttempts = currentQ.attempts + 1
    
    setGame(prev => {
      if (!prev) return prev
      
      const updatedQuestions = [...prev.questions]
      const q = { ...updatedQuestions[prev.currentQuestionIndex] }
      q.userValue = userValue
      q.latencyMs = latency
      q.attempts = newAttempts
      q.comboBefore = prev.currentCombo
      
      if (isCorrect) {
        // Correct answer
        const newCombo = prev.currentCombo + 1
        const speedStar = isWithinTimeLimit
        const questionScore = calculateQuestionScore(
          true,
          newCombo,
          q.isBoss,
          speedStar
        )
        
        q.result = 'correct'
        q.comboAfter = newCombo
        q.speedStarGained = speedStar
        
        const newSpeedStars = prev.speedStars + (speedStar ? 1 : 0)
        const newMaxCombo = Math.max(prev.maxCombo, newCombo)
        
        // Play sounds
        playCorrectSound()
        if (newCombo >= 2) {
          setTimeout(() => playComboSound(newCombo), 100)
        }
        if (speedStar) {
          setTimeout(() => playSpeedStarSound(), 150)
        }
        
        updatedQuestions[prev.currentQuestionIndex] = q
        
        // Check if this was the last question
        const nextIndex = prev.currentQuestionIndex + 1
        const isFinished = nextIndex >= prev.questionsPlanned || 
          (prev.mode === 'time_attack' && prev.timeRemaining <= 0)
        
        if (isFinished) {
          if (timerRef.current) clearInterval(timerRef.current)
          setTimeout(() => playFinishSound(), 200)
          return {
            ...prev,
            questions: updatedQuestions,
            score: prev.score + questionScore,
            currentCombo: newCombo,
            maxCombo: newMaxCombo,
            speedStars: newSpeedStars,
            runState: 'finished',
            endAt: Date.now(),
            questionsAnswered: nextIndex,
          }
        }
        
        // Auto-advance to next question immediately
        questionStartTime.current = Date.now()
        
        return {
          ...prev,
          questions: updatedQuestions,
          score: prev.score + questionScore,
          currentCombo: newCombo,
          maxCombo: newMaxCombo,
          speedStars: newSpeedStars,
          currentQuestionIndex: nextIndex,
          questionsAnswered: nextIndex,
          questionState: 'show' as QuestionState,
        }
      } else {
        // Wrong answer
        const canRetry = newAttempts <= GAME_CONFIG.retryPerQuestion && !q.retryUsed
        const canUseShield = prev.shieldRemaining > 0 && !canRetry
        
        if (canRetry) {
          // Allow retry
          q.retryUsed = true
          updatedQuestions[prev.currentQuestionIndex] = q
          playWrongSound()
          
          return {
            ...prev,
            questions: updatedQuestions,
            questionState: 'wrong_soft' as QuestionState,
          }
        } else if (canUseShield) {
          // Use shield
          q.shieldUsed = true
          q.result = 'wrong'
          q.comboAfter = prev.currentCombo // Keep combo
          updatedQuestions[prev.currentQuestionIndex] = q
          playShieldSound()
          
          return {
            ...prev,
            questions: updatedQuestions,
            shieldRemaining: prev.shieldRemaining - 1,
            shieldUsed: prev.shieldUsed + 1,
            questionState: 'wrong_soft' as QuestionState,
          }
        } else {
          // Final wrong
          q.result = 'wrong'
          q.comboAfter = 0
          updatedQuestions[prev.currentQuestionIndex] = q
          playWrongSound()
          
          return {
            ...prev,
            questions: updatedQuestions,
            currentCombo: 0,
            questionState: 'wrong_final' as QuestionState,
          }
        }
      }
    })
  }, [game])
  
  // Move to next question
  const nextQuestion = useCallback(() => {
    if (!game) return
    
    setGame(prev => {
      if (!prev) return prev
      
      const nextIndex = prev.currentQuestionIndex + 1
      const isFinished = nextIndex >= prev.questionsPlanned || 
        (prev.mode === 'time_attack' && prev.timeRemaining <= 0)
      
      if (isFinished) {
        if (timerRef.current) clearInterval(timerRef.current)
        return {
          ...prev,
          runState: 'finished',
          endAt: Date.now(),
          questionsAnswered: nextIndex,
        }
      }
      
      questionStartTime.current = Date.now()
      
      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        questionsAnswered: nextIndex,
        questionState: 'show',
      }
    })
  }, [game])
  
  // Retry current question (after soft wrong)
  const retryQuestion = useCallback(() => {
    if (!game) return
    
    questionStartTime.current = Date.now()
    setGame(prev => {
      if (!prev) return prev
      return { ...prev, questionState: 'input' as QuestionState }
    })
  }, [game])
  
  // Set question state to input (after showing question)
  const startInput = useCallback(() => {
    if (!game) return
    
    questionStartTime.current = Date.now()
    setGame(prev => {
      if (!prev) return prev
      return { ...prev, questionState: 'input' as QuestionState }
    })
  }, [game])
  
  // Skip current question
  const skipQuestion = useCallback(() => {
    if (!game) return
    
    setGame(prev => {
      if (!prev) return prev
      
      const updatedQuestions = [...prev.questions]
      const q = { ...updatedQuestions[prev.currentQuestionIndex] }
      q.result = 'skip'
      q.comboAfter = 0
      updatedQuestions[prev.currentQuestionIndex] = q
      
      return {
        ...prev,
        questions: updatedQuestions,
        currentCombo: 0,
        questionState: 'wrong_final' as QuestionState,
      }
    })
  }, [game])
  
  // Reset game
  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGame(null)
  }, [])
  
  // Calculate final stats
  const getStats = useCallback((): GameStats | null => {
    if (!game) return null
    
    const answeredQuestions = game.questions.filter(q => q.result !== 'pending')
    const correctCount = answeredQuestions.filter(q => q.result === 'correct').length
    const wrongQuestions = answeredQuestions.filter(q => q.result === 'wrong' || q.result === 'skip')
    
    const totalLatency = answeredQuestions.reduce((sum, q) => sum + q.latencyMs, 0)
    const avgTime = answeredQuestions.length > 0 ? totalLatency / answeredQuestions.length : 0
    
    return {
      totalScore: game.score,
      correctCount,
      wrongCount: wrongQuestions.length,
      accuracy: answeredQuestions.length > 0 ? (correctCount / answeredQuestions.length) * 100 : 0,
      maxCombo: game.maxCombo,
      speedStars: game.speedStars,
      shieldUsed: game.shieldUsed,
      averageTime: avgTime,
      wrongQuestions,
    }
  }, [game])
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])
  
  return {
    game,
    startGame,
    submitAnswer,
    nextQuestion,
    retryQuestion,
    startInput,
    skipQuestion,
    resetGame,
    getStats,
  }
}
