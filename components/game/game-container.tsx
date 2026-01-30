'use client'

import { useGame } from '@/hooks/use-game'
import { GameStart } from './game-start'
import { GameHud } from './game-hud'
import { QuestionCard } from './question-card'
import { GameResults } from './game-results'
import type { GameMode, Difficulty } from '@/lib/game-types'

export function GameContainer() {
  const {
    game,
    startGame,
    submitAnswer,
    nextQuestion,
    retryQuestion,
    startInput,
    resetGame,
    getStats,
  } = useGame()
  
  // Start screen
  if (!game) {
    return <GameStart onStart={startGame} />
  }
  
  // Results screen
  if (game.runState === 'finished') {
    const stats = getStats()
    if (!stats) return null
    
    return (
      <GameResults
        game={game}
        stats={stats}
        onPlayAgain={() => startGame(game.mode, game.difficulty)}
        onHome={resetGame}
      />
    )
  }
  
  // Game screen
  const currentQuestion = game.questions[game.currentQuestionIndex]
  if (!currentQuestion) return null
  
  return (
    <div className="flex h-[100dvh] flex-col items-center p-4 pt-6 overflow-hidden">
      <GameHud game={game} />
      
      <div className="flex-1 flex items-start justify-center w-full pt-4 pb-2 overflow-hidden">
        <QuestionCard
          question={currentQuestion}
          questionState={game.questionState}
          game={game}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          onRetry={retryQuestion}
          onStartInput={startInput}
        />
      </div>
    </div>
  )
}
