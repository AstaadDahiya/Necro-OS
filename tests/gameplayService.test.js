import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { gameplayService } from '../src/utils/gameplayService.js'
import { useAdvancedHauntingStore } from '../src/stores/advancedHaunting.js'

describe('Gameplay Service - Cursed Files', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    gameplayService.initialize()
  })

  it('should generate between 3 and 7 cursed files', () => {
    gameplayService.generateCursedFiles()
    const files = gameplayService.getCursedFileList()
    
    expect(files.length).toBeGreaterThanOrEqual(3)
    expect(files.length).toBeLessThanOrEqual(7)
  })

  it('should generate cursed files with correct properties', () => {
    gameplayService.generateCursedFiles()
    const files = gameplayService.getCursedFileList()
    
    files.forEach(file => {
      expect(file).toHaveProperty('id')
      expect(file).toHaveProperty('name')
      expect(file).toHaveProperty('possessionValue')
      expect(file.possessionValue).toBe(8)
    })
  })

  it('should delete cursed file and reduce possession', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    gameplayService.generateCursedFiles()
    const files = gameplayService.getCursedFileList()
    const fileId = files[0].id
    
    const success = gameplayService.deleteCursedFile(fileId)
    
    expect(success).toBe(true)
    expect(store.possessionLevel).toBe(42)
    expect(gameplayService.getCursedFileList().length).toBe(files.length - 1)
  })

  it('should not delete same file twice', () => {
    gameplayService.generateCursedFiles()
    const files = gameplayService.getCursedFileList()
    const fileId = files[0].id
    
    gameplayService.deleteCursedFile(fileId)
    const secondAttempt = gameplayService.deleteCursedFile(fileId)
    
    expect(secondAttempt).toBe(false)
  })
})

describe('Gameplay Service - Text Exorcism', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    gameplayService.initialize()
    vi.useFakeTimers()
  })

  it('should perform text exorcism with correct phrase', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    const success = gameplayService.performTextExorcism('begone spirit')
    
    expect(success).toBe(true)
    expect(store.possessionLevel).toBe(35)
  })

  it('should be case insensitive', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    const success = gameplayService.performTextExorcism('BEGONE SPIRIT')
    
    expect(success).toBe(true)
    expect(store.possessionLevel).toBe(35)
  })

  it('should fail with incorrect phrase', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    const success = gameplayService.performTextExorcism('go away ghost')
    
    expect(success).toBe(false)
    expect(store.possessionLevel).toBe(50)
  })

  it('should respect cooldown period', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    gameplayService.performTextExorcism('begone spirit')
    const secondAttempt = gameplayService.performTextExorcism('begone spirit')
    
    expect(secondAttempt).toBe(false)
  })

  it('should allow exorcism after cooldown expires', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    gameplayService.performTextExorcism('begone spirit')
    vi.advanceTimersByTime(120000)
    
    const secondAttempt = gameplayService.performTextExorcism('begone spirit')
    expect(secondAttempt).toBe(true)
  })
})

describe('Gameplay Service - Puzzle Exorcism', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    gameplayService.initialize()
  })

  it('should generate puzzle with 4-6 symbols', () => {
    const puzzle = gameplayService.generateSymbolPuzzle()
    
    expect(puzzle.sequence.length).toBeGreaterThanOrEqual(4)
    expect(puzzle.sequence.length).toBeLessThanOrEqual(6)
  })

  it('should validate correct puzzle solution', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    const puzzle = gameplayService.generateSymbolPuzzle()
    const success = gameplayService.validatePuzzleSolution(puzzle.id, puzzle.sequence)
    
    expect(success).toBe(true)
    expect(store.possessionLevel).toBe(30)
  })

  it('should reject incorrect puzzle solution', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    
    const puzzle = gameplayService.generateSymbolPuzzle()
    const wrongSolution = ['⛧', '☠', '👁', '🕯']
    const success = gameplayService.validatePuzzleSolution(puzzle.id, wrongSolution)
    
    expect(success).toBe(false)
    expect(store.possessionLevel).toBe(50)
  })

  it('should expire puzzle after 30 seconds', () => {
    vi.useFakeTimers()
    
    const puzzle = gameplayService.generateSymbolPuzzle()
    vi.advanceTimersByTime(31000)
    
    const success = gameplayService.validatePuzzleSolution(puzzle.id, puzzle.sequence)
    expect(success).toBe(false)
  })
})

describe('Gameplay Service - Achievement Tracking', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    gameplayService.initialize()
    vi.useFakeTimers()
  })

  it('should track exorcism count for Exorcist achievement', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(100)
    
    // Perform 5 exorcisms quickly
    for (let i = 0; i < 5; i++) {
      gameplayService.performTextExorcism('begone spirit')
      vi.advanceTimersByTime(30000)
    }
    
    gameplayService.checkAchievements()
    expect(store.achievements.has('exorcist')).toBe(true)
  })

  it('should track easter egg discoveries', () => {
    const store = useAdvancedHauntingStore()
    
    gameplayService.discoverEasterEgg('konami')
    expect(store.discoveredEasterEggs.has('konami')).toBe(true)
  })

  it('should unlock Paranormal Investigator when all eggs found', () => {
    const store = useAdvancedHauntingStore()
    
    gameplayService.discoverEasterEgg('konami')
    gameplayService.discoverEasterEgg('notepad-help')
    gameplayService.discoverEasterEgg('coordinate-666')
    gameplayService.discoverEasterEgg('possession-66')
    
    gameplayService.checkAchievements()
    expect(store.achievements.has('paranormal-investigator')).toBe(true)
  })
})
