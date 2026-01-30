'use client'

import { cn } from '@/lib/utils'
import type { GameRun } from '@/lib/game-types'
import { getComboMultiplier } from '@/lib/game-types'
import { Flame, Shield, Star, Trophy } from 'lucide-react'

interface GameHudProps {
  game: GameRun
}

export function GameHud({ game }: GameHudProps) {
  const comboMultiplier = getComboMultiplier(game.currentCombo)
  
  return (
    <div className="w-full max-w-md mx-auto">
      {/* Stats Row */}
      <div className="flex items-center justify-between gap-2 p-3 bg-card rounded-xl border shadow-sm">
        {/* Score */}
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">{game.score}</div>
            <div className="text-xs text-muted-foreground">得分</div>
          </div>
        </div>
        
        {/* Combo */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all",
          game.currentCombo >= 2 && "bg-destructive/10"
        )}>
          <Flame className={cn(
            "h-5 w-5 transition-all",
            game.currentCombo >= 6 ? "text-destructive animate-pulse" :
            game.currentCombo >= 4 ? "text-destructive" :
            game.currentCombo >= 2 ? "text-warning" :
            "text-muted-foreground"
          )} />
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">
              {game.currentCombo}
              {comboMultiplier > 1 && (
                <span className="text-sm text-destructive ml-1">x{comboMultiplier}</span>
              )}
            </div>
            <div className="text-xs text-muted-foreground">连击</div>
          </div>
        </div>
        
        {/* Speed Stars */}
        <div className="flex items-center gap-2">
          <Star className={cn(
            "h-5 w-5",
            game.speedStars > 0 ? "text-warning fill-warning" : "text-muted-foreground"
          )} />
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">{game.speedStars}</div>
            <div className="text-xs text-muted-foreground">速度星</div>
          </div>
        </div>
        
        {/* Shield */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg",
          game.shieldRemaining > 0 && "bg-shield/10"
        )}>
          <Shield className={cn(
            "h-5 w-5",
            game.shieldRemaining > 0 ? "text-shield" : "text-muted-foreground opacity-50"
          )} />
          <div className="text-right">
            <div className="text-lg font-bold font-mono text-foreground">{game.shieldRemaining}</div>
            <div className="text-xs text-muted-foreground">护盾</div>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${(game.currentQuestionIndex / game.questionsPlanned) * 100}%` }}
        />
      </div>
    </div>
  )
}
