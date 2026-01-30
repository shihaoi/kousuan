'use client'

import React from "react"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { Question, QuestionState, GameRun } from '@/lib/game-types'
import { GAME_CONFIG, getComboMultiplier } from '@/lib/game-types'
import { Crown, Zap, Shield, RotateCcw, ArrowRight, Check, X } from 'lucide-react'

interface QuestionCardProps {
  question: Question
  questionState: QuestionState
  game: GameRun
  onSubmit: (answer: string) => void
  onNext: () => void
  onRetry: () => void
  onStartInput: () => void
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
  const [showAnimation, setShowAnimation] = useState(false)
  
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
  
  // Trigger animation on state changes
  useEffect(() => {
    if (questionState === 'wrong_final' || questionState === 'wrong_soft') {
      setShowAnimation(true)
      const timer = setTimeout(() => setShowAnimation(false), 300)
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
      {/* Question Display */}
      <Card className={cn(
        "relative overflow-hidden transition-all duration-200",
        showAnimation && isWrongSoft && "ring-4 ring-warning",
        showAnimation && isWrongFinal && "ring-4 ring-destructive",
        question.isBoss && "ring-2 ring-boss"
      )}>
        {/* Boss Badge */}
        {question.isBoss && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-boss text-boss-foreground px-2 py-1 rounded-full text-xs font-semibold">
            <Crown className="h-3 w-3" />
            关卡 x1.5
          </div>
        )}
        
        <CardContent className="p-6">
          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-4 text-sm text-muted-foreground">
            <span>第 {question.index + 1}/{game.questionsPlanned} 题</span>
            {game.mode === 'time_attack' && (
              <span className={cn(
                "font-mono",
                game.timeRemaining <= 10 && "text-destructive font-bold"
              )}>
                {Math.floor(game.timeRemaining / 60)}:{(game.timeRemaining % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
          
          {/* Expression */}
          <div className={cn(
            "text-center py-8 transition-transform duration-200",
            showAnimation && questionState === 'show' && "scale-110"
          )}>
            <div className="text-4xl md:text-5xl font-bold font-mono text-foreground tracking-wider">
              {question.expression} = ?
            </div>
          </div>
          
          {/* Feedback Messages */}
          {isWrongSoft && question.shieldUsed && (
            <div className="flex items-center justify-center gap-2 text-shield font-semibold animate-in fade-in slide-in-from-bottom-2">
              <Shield className="h-5 w-5" />
              <span>护盾已激活！答案：{question.answer}</span>
            </div>
          )}
          
          {isWrongSoft && !question.shieldUsed && (
            <div className="flex items-center justify-center gap-2 text-warning font-semibold animate-in fade-in slide-in-from-bottom-2">
              <RotateCcw className="h-5 w-5" />
              <span>再试一次！</span>
            </div>
          )}
          
          {isWrongFinal && (
            <div className="flex items-center justify-center gap-2 text-destructive font-semibold animate-in fade-in slide-in-from-bottom-2">
              <X className="h-5 w-5" />
              <span>答错了。正确答案：{question.answer}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Input Area - Always visible for fixed layout */}
      <form onSubmit={handleSubmit} className="space-y-3">
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
        
        {/* Number Keypad - Always visible */}
        <div className="grid grid-cols-4 gap-2">
          {['7', '8', '9', 'back'].map((key) => (
            <Button
              key={key}
              type="button"
              variant={key === 'back' ? 'outline' : 'secondary'}
              className="h-12 text-lg font-semibold"
              onClick={() => handleKeypadPress(key)}
              disabled={!showKeypad}
            >
              {key === 'back' ? '←' : key}
            </Button>
          ))}
          {['4', '5', '6', 'clear'].map((key) => (
            <Button
              key={key}
              type="button"
              variant={key === 'clear' ? 'outline' : 'secondary'}
              className="h-12 text-lg font-semibold"
              onClick={() => handleKeypadPress(key)}
              disabled={!showKeypad}
            >
              {key === 'clear' ? 'C' : key}
            </Button>
          ))}
          {['1', '2', '3', 'submit'].map((key) => (
            <Button
              key={key}
              type={key === 'submit' ? 'submit' : 'button'}
              variant={key === 'submit' ? 'default' : 'secondary'}
              className={cn(
                "h-12 text-lg font-semibold",
                key === 'submit' && "bg-primary text-primary-foreground"
              )}
              onClick={() => key !== 'submit' && handleKeypadPress(key)}
              disabled={!showKeypad}
            >
              {key === 'submit' ? '↵' : key}
            </Button>
          ))}
          {['-', '0', '00'].map((key) => (
            <Button
              key={key}
              type="button"
              variant="secondary"
              className="h-12 text-lg font-semibold"
              onClick={() => handleKeypadPress(key)}
              disabled={!showKeypad}
            >
              {key}
            </Button>
          ))}
        </div>
      </form>
      
      {/* Action Buttons */}
      {isWrongSoft && !question.shieldUsed && (
        <Button onClick={onRetry} className="w-full h-12">
          <RotateCcw className="h-4 w-4 mr-2" />
          再试一次
        </Button>
      )}
      
      {(isWrongFinal || (isWrongSoft && question.shieldUsed)) && (
        <Button onClick={onNext} className="w-full h-12">
          下一题
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      )}
    </div>
  )
}
