/**
 * ============================================================================
 * sounds.ts - 音效系统
 * ============================================================================
 *
 * [INPUT]: Web Audio API (浏览器原生)
 * [OUTPUT]: playCorrectSound, playWrongSound, playComboSound, playShieldSound,
 *           playBossSound, playSpeedStarSound, playFinishSound
 * [POS]: lib 模块的音效服务，被 hooks/use-game.ts 消费
 *        使用 Web Audio API 动态生成音调，无需加载音频文件
 * [PROTOCOL]: 变更时更新此头部，然后检查 lib/CLAUDE.md
 */

// ============================================================================
// AudioContext 管理
// ============================================================================

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

function playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.3) {
  const ctx = getAudioContext()
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
  
  gainNode.gain.setValueAtTime(volume, ctx.currentTime)
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
  
  oscillator.start(ctx.currentTime)
  oscillator.stop(ctx.currentTime + duration)
}

// Correct answer - rising pleasant tone
export function playCorrectSound() {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Two quick rising notes
  playTone(523.25, 0.1, 'sine', 0.2) // C5
  setTimeout(() => playTone(659.25, 0.15, 'sine', 0.25), 80) // E5
}

// Wrong answer - descending tone
export function playWrongSound() {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  
  // Descending buzzy tone
  playTone(330, 0.15, 'square', 0.15) // E4
  setTimeout(() => playTone(262, 0.2, 'square', 0.12), 100) // C4
}

// Combo sound - triumphant ascending arpeggio
export function playComboSound(comboLevel: number) {
  // Higher combo = more elaborate sound
  const baseFreq = 440 // A4
  
  if (comboLevel >= 5) {
    // Big combo - full arpeggio
    playTone(baseFreq, 0.1, 'sine', 0.2)
    setTimeout(() => playTone(baseFreq * 1.25, 0.1, 'sine', 0.22), 50) // C#5
    setTimeout(() => playTone(baseFreq * 1.5, 0.1, 'sine', 0.24), 100) // E5
    setTimeout(() => playTone(baseFreq * 2, 0.2, 'sine', 0.26), 150) // A5
  } else if (comboLevel >= 3) {
    // Medium combo - two notes
    playTone(baseFreq, 0.1, 'sine', 0.2)
    setTimeout(() => playTone(baseFreq * 1.5, 0.15, 'sine', 0.22), 60)
  } else {
    // Small combo boost on correct sound
    playTone(baseFreq * 1.25, 0.12, 'triangle', 0.18)
  }
}

// Shield activated sound
export function playShieldSound() {
  playTone(880, 0.1, 'sine', 0.2) // A5
  setTimeout(() => playTone(1100, 0.15, 'triangle', 0.15), 50)
}

// Boss question intro
export function playBossSound() {
  playTone(220, 0.2, 'sawtooth', 0.12) // A3
  setTimeout(() => playTone(277.18, 0.2, 'sawtooth', 0.14), 150) // C#4
  setTimeout(() => playTone(329.63, 0.3, 'sawtooth', 0.16), 300) // E4
}

// Speed star earned
export function playSpeedStarSound() {
  playTone(1046.5, 0.08, 'sine', 0.2) // C6
  setTimeout(() => playTone(1318.5, 0.1, 'sine', 0.22), 60) // E6
  setTimeout(() => playTone(1568, 0.15, 'sine', 0.18), 120) // G6
}

// Game finish fanfare
export function playFinishSound() {
  const notes = [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.25, 'sine', 0.2), i * 120)
  })
}
