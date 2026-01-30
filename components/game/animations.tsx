'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'
import { Star, Flame, Sparkles, Check, Zap } from 'lucide-react'

// ============================================
// 1. 答对时的庆祝动画 - 绿色对勾 + 放射粒子
// ============================================
interface CorrectAnimationProps {
  show: boolean
  onComplete?: () => void
}

export function CorrectAnimation({ show, onComplete }: CorrectAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={onComplete}
        >
          {/* 中心对勾 */}
          <motion.div
            className="relative"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 400, 
              damping: 15,
              duration: 0.4 
            }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-success flex items-center justify-center shadow-lg"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Check className="w-14 h-14 text-white stroke-[3]" />
            </motion.div>
          </motion.div>

          {/* 放射粒子 */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-success"
              initial={{ 
                x: 0, 
                y: 0, 
                scale: 0,
                opacity: 1 
              }}
              animate={{ 
                x: Math.cos((i * Math.PI * 2) / 8) * 100,
                y: Math.sin((i * Math.PI * 2) / 8) * 100,
                scale: [0, 1.5, 0],
                opacity: [1, 1, 0]
              }}
              transition={{ 
                duration: 0.6, 
                delay: 0.1,
                ease: "easeOut" 
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// 2. 连击动画 - 火焰 + 数字弹跳
// ============================================
interface ComboAnimationProps {
  combo: number
  show: boolean
}

export function ComboAnimation({ combo, show }: ComboAnimationProps) {
  if (!show || combo < 2) return null

  const getComboColor = () => {
    if (combo >= 6) return 'text-red-500'
    if (combo >= 4) return 'text-orange-500'
    return 'text-yellow-500'
  }

  const getComboSize = () => {
    if (combo >= 6) return 'text-6xl'
    if (combo >= 4) return 'text-5xl'
    return 'text-4xl'
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 连击数字 */}
          <motion.div
            className={`font-bold ${getComboSize()} ${getComboColor()} flex items-center gap-2`}
            initial={{ scale: 0, y: 50 }}
            animate={{ 
              scale: [0, 1.3, 1],
              y: [50, -20, 0]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 15
            }}
          >
            <motion.div
              animate={{ 
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              <Flame className="w-12 h-12 fill-current" />
            </motion.div>
            <span>{combo}连击!</span>
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ duration: 0.5, repeat: 1 }}
            >
              <Flame className="w-12 h-12 fill-current" />
            </motion.div>
          </motion.div>

          {/* 火星粒子 */}
          {combo >= 4 && [...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-orange-400"
              initial={{ 
                x: (Math.random() - 0.5) * 50, 
                y: 0, 
                opacity: 1 
              }}
              animate={{ 
                y: -150 - Math.random() * 100,
                x: (Math.random() - 0.5) * 200,
                opacity: 0,
                scale: [1, 0]
              }}
              transition={{ 
                duration: 0.8 + Math.random() * 0.4,
                ease: "easeOut"
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// 3. 速度星动画 - 星星飞入
// ============================================
interface SpeedStarAnimationProps {
  show: boolean
}

export function SpeedStarAnimation({ show }: SpeedStarAnimationProps) {
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
            className="flex items-center gap-2 text-warning"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ 
              scale: [0, 1.5, 1],
              rotate: [−30, 10, 0]
            }}
            transition={{ type: "spring", stiffness: 400, damping: 12 }}
          >
            <motion.div
              animate={{ 
                rotate: 360,
                scale: [1, 1.3, 1]
              }}
              transition={{ 
                rotate: { duration: 0.6, ease: "linear" },
                scale: { duration: 0.3, repeat: 2 }
              }}
            >
              <Star className="w-16 h-16 fill-warning text-warning" />
            </motion.div>
            <motion.span 
              className="text-3xl font-bold"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              快!
            </motion.span>
          </motion.div>

          {/* 星星拖尾 */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{ 
                x: -200 - i * 30, 
                y: 100 + i * 20, 
                opacity: 0,
                scale: 0.5
              }}
              animate={{ 
                x: 0,
                y: 0,
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0]
              }}
              transition={{ 
                duration: 0.4,
                delay: i * 0.05
              }}
            >
              <Star className="w-6 h-6 fill-warning/50 text-warning/50" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// 4. 分数飘动画 - +100 飘起来
// ============================================
interface ScorePopProps {
  score: number
  show: boolean
  isBonus?: boolean
}

export function ScorePop({ score, show, isBonus }: ScorePopProps) {
  if (!show || score === 0) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={`fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-30 font-bold text-4xl ${
            isBonus ? 'text-warning' : 'text-primary'
          }`}
          initial={{ y: 0, opacity: 1, scale: 0.5 }}
          animate={{ 
            y: -80, 
            opacity: [1, 1, 0],
            scale: [0.5, 1.2, 1]
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          +{score}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// 5. 答错抖动动画
// ============================================
interface ShakeWrapperProps {
  shake: boolean
  children: ReactNode
}

export function ShakeWrapper({ shake, children }: ShakeWrapperProps) {
  return (
    <motion.div
      animate={shake ? {
        x: [0, -10, 10, -10, 10, -5, 5, 0],
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// 6. 护盾激活动画
// ============================================
interface ShieldAnimationProps {
  show: boolean
}

export function ShieldAnimation({ show }: ShieldAnimationProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* 护盾光环 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-64 h-64 rounded-full border-4 border-shield"
              animate={{ 
                boxShadow: [
                  '0 0 0 0 rgba(100, 150, 255, 0.4)',
                  '0 0 0 30px rgba(100, 150, 255, 0)',
                ],
              }}
              transition={{ duration: 0.8, repeat: 2 }}
            />
          </motion.div>
          
          {/* 护盾文字 */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="text-shield text-3xl font-bold flex items-center gap-2">
              <Sparkles className="w-8 h-8" />
              护盾保护!
              <Sparkles className="w-8 h-8" />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ============================================
// 7. 题目切换动画包装器
// ============================================
interface QuestionTransitionProps {
  questionKey: number
  children: ReactNode
}

export function QuestionTransition({ questionKey, children }: QuestionTransitionProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionKey}
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -50, opacity: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================
// 8. 数字输入弹跳效果
// ============================================
interface NumberBounceProps {
  children: ReactNode
  trigger: string | number
}

export function NumberBounce({ children, trigger }: NumberBounceProps) {
  return (
    <motion.div
      key={trigger}
      initial={{ scale: 1.1 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 15 }}
    >
      {children}
    </motion.div>
  )
}

// ============================================
// 9. 按钮点击效果
// ============================================
interface BouncyButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function BouncyButton({ children, onClick, disabled, className }: BouncyButtonProps) {
  return (
    <motion.button
      className={className}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  )
}
