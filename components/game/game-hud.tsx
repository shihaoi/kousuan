'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { GameRun } from '@/lib/game-types'
import { getComboMultiplier } from '@/lib/game-types'
import { Flame, Shield, Star, Trophy } from 'lucide-react'

interface GameHudProps {
  game: GameRun
}

// 数值变化动画组件
function AnimatedNumber({ value, className }: { value: number; className?: string }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1.3, color: 'hsl(var(--primary))' }}
      animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={className}
    >
      {value}
    </motion.span>
  )
}

export function GameHud({ game }: GameHudProps) {
  const comboMultiplier = getComboMultiplier(game.currentCombo)
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Stats Row */}
      <div className="flex items-center justify-between gap-2 p-3 bg-card rounded-xl border shadow-sm">
        {/* Score - 带跳动动画 */}
        <div className="flex items-center gap-2">
          <motion.div
            key={game.score}
            animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Trophy className="h-5 w-5 text-primary" />
          </motion.div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">
              <AnimatedNumber value={game.score} />
            </div>
            <div className="text-xs text-muted-foreground">得分</div>
          </div>
        </div>
        
        {/* Combo - 火焰抖动 */}
        <motion.div 
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
            game.currentCombo >= 2 && "bg-destructive/10"
          )}
          animate={game.currentCombo >= 4 ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            key={game.currentCombo}
            animate={game.currentCombo >= 2 ? { 
              rotate: [0, -15, 15, -10, 10, 0],
              scale: [1, 1.3, 1]
            } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Flame className={cn(
              "h-5 w-5 transition-all",
              game.currentCombo >= 6 ? "text-destructive" :
              game.currentCombo >= 4 ? "text-destructive" :
              game.currentCombo >= 2 ? "text-warning" :
              "text-muted-foreground"
            )} />
          </motion.div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">
              <AnimatedNumber value={game.currentCombo} />
              <AnimatePresence>
                {comboMultiplier > 1 && (
                  <motion.span 
                    className="text-sm text-destructive ml-1"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                  >
                    x{comboMultiplier}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
            <div className="text-xs text-muted-foreground">连击</div>
          </div>
        </motion.div>
        
        {/* Speed Stars - 星星旋转 */}
        <div className="flex items-center gap-2">
          <motion.div
            key={game.speedStars}
            animate={game.speedStars > 0 ? { 
              rotate: 360,
              scale: [1, 1.4, 1]
            } : {}}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Star className={cn(
              "h-5 w-5",
              game.speedStars > 0 ? "text-warning fill-warning" : "text-muted-foreground"
            )} />
          </motion.div>
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">
              <AnimatedNumber value={game.speedStars} />
            </div>
            <div className="text-xs text-muted-foreground">速度星</div>
          </div>
        </div>
        
        {/* Shield - 护盾闪烁 */}
        <motion.div 
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg",
            game.shieldRemaining > 0 && "bg-shield/10"
          )}
          animate={game.shieldRemaining === 0 ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 1, repeat: 2, ease: "easeInOut" }}
        >
          <Shield className={cn(
            "h-5 w-5",
            game.shieldRemaining > 0 ? "text-shield" : "text-muted-foreground opacity-50"
          )} />
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">
              <AnimatedNumber value={game.shieldRemaining} />
            </div>
            <div className="text-xs text-muted-foreground">护盾</div>
          </div>
        </motion.div>
      </div>
      
      {/* Progress Bar - 带动画 */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${(game.currentQuestionIndex / game.questionsPlanned) * 100}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
    </div>
  )
}
