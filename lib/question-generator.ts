import type { Difficulty, Question } from './game-types'
import { generateId } from './game-types'

type Operation = '+' | '-' | '*' | '/'

interface QuestionTemplate {
  num1Range: [number, number]
  num2Range: [number, number]
  operations: Operation[]
}

const DIFFICULTY_CONFIG: Record<Difficulty, QuestionTemplate[]> = {
  easy: [
    // Two-digit addition
    { num1Range: [10, 99], num2Range: [1, 99], operations: ['+'] },
    // Two-digit subtraction (result >= 0)
    { num1Range: [10, 99], num2Range: [1, 50], operations: ['-'] },
    // Single digit addition
    { num1Range: [1, 9], num2Range: [1, 9], operations: ['+'] },
  ],
  medium: [
    // Three-digit addition
    { num1Range: [100, 999], num2Range: [10, 999], operations: ['+'] },
    // Three-digit subtraction
    { num1Range: [100, 999], num2Range: [10, 500], operations: ['-'] },
    // Simple multiplication
    { num1Range: [2, 12], num2Range: [2, 12], operations: ['*'] },
    // Two-digit mixed
    { num1Range: [10, 99], num2Range: [10, 99], operations: ['+', '-'] },
  ],
  hard: [
    // Larger multiplication
    { num1Range: [2, 20], num2Range: [2, 20], operations: ['*'] },
    // Three-digit mixed
    { num1Range: [100, 999], num2Range: [100, 999], operations: ['+', '-'] },
    // Division (exact)
    { num1Range: [2, 12], num2Range: [2, 12], operations: ['/'] },
    // Complex multiplication
    { num1Range: [11, 25], num2Range: [2, 15], operations: ['*'] },
  ],
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateExpression(difficulty: Difficulty): { expression: string; answer: number } {
  const templates = DIFFICULTY_CONFIG[difficulty]
  const template = templates[randomInt(0, templates.length - 1)]
  const operation = template.operations[randomInt(0, template.operations.length - 1)]
  
  let num1 = randomInt(template.num1Range[0], template.num1Range[1])
  let num2 = randomInt(template.num2Range[0], template.num2Range[1])
  let answer: number
  
  switch (operation) {
    case '+':
      answer = num1 + num2
      break
    case '-':
      // Ensure positive result
      if (num1 < num2) [num1, num2] = [num2, num1]
      answer = num1 - num2
      break
    case '*':
      answer = num1 * num2
      break
    case '/':
      // Generate division that has exact integer result
      const product = num1 * num2
      num1 = product
      answer = num1 / num2
      break
    default:
      answer = num1 + num2
  }
  
  const expression = `${num1} ${operation} ${num2}`
  return { expression, answer }
}

export function generateQuestions(
  count: number,
  difficulty: Difficulty,
  bossCount: number = 1
): Question[] {
  const questions: Question[] = []
  
  // Determine boss question indices (from last 3 questions)
  const bossIndices = new Set<number>()
  const lastThreeStart = Math.max(0, count - 3)
  while (bossIndices.size < bossCount && bossIndices.size < 3) {
    const idx = randomInt(lastThreeStart, count - 1)
    bossIndices.add(idx)
  }
  
  for (let i = 0; i < count; i++) {
    const { expression, answer } = generateExpression(difficulty)
    questions.push({
      index: i,
      expression,
      answer,
      isBoss: bossIndices.has(i),
      attempts: 0,
      result: 'pending',
      userValue: null,
      latencyMs: 0,
      comboBefore: 0,
      comboAfter: 0,
      speedStarGained: false,
      shieldUsed: false,
      retryUsed: false,
    })
  }
  
  return questions
}

// Parse user input to extract number
export function parseUserInput(input: string): number | null {
  // Remove whitespace
  const cleaned = input.trim()
  
  // Try parsing as number directly
  const num = parseInt(cleaned, 10)
  if (!isNaN(num)) return num
  
  // Chinese number mapping
  const chineseNums: Record<string, number> = {
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4,
    '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
    '十': 10, '百': 100, '千': 1000,
    '两': 2,
  }
  
  // Simple Chinese number parsing
  let result = 0
  let current = 0
  
  for (const char of cleaned) {
    if (chineseNums[char] !== undefined) {
      const val = chineseNums[char]
      if (val >= 10) {
        if (current === 0) current = 1
        result += current * val
        current = 0
      } else {
        current = val
      }
    }
  }
  result += current
  
  return result > 0 ? result : null
}
