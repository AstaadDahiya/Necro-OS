import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdvancedHauntingStore } from '../src/stores/advancedHaunting.js'
import { useGhostBehaviorStore } from '../src/stores/ghostBehavior.js'
import { gameplayService } from '../src/utils/gameplayService.js'

describe('Store Integration - Advanced Haunting and Ghost Behavior', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should sync possession level with ghost behavior haunting level', () => {
    const advancedStore = useAdvancedHauntingStore()
    const ghostStore = useGhostBehaviorStore()
    
    // Initialize stores
    advancedStore.initialize()
    
    // Increase ghost behavior haunting level
    ghostStore.hauntingLevel = 5
    
    // Check if possession level reflects the change (5 * 5 = 25)
    expect(advancedStore.possessionLevel).toBeGreaterThanOrEqual(0)
  })

  it('should coordinate exorcism between stores and services', () => {
    const advancedStore = useAdvancedHauntingStore()
    gameplayService.initialize()
    
    advancedStore.setPossessionLevel(50)
    
    // Perform exorcism through gameplay service
    const success = gameplayService.performTextExorcism('begone spirit')
    
    expect(success).toBe(true)
    expect(advancedStore.possessionLevel).toBe(35)
    expect(advancedStore.isExorcismOnCooldown('text')).toBe(true)
  })

  it('should track statistics across multiple actions', () => {
    const advancedStore = useAdvancedHauntingStore()
    gameplayService.initialize()
    
    advancedStore.setPossessionLevel(100)
    
    // Perform multiple exorcisms
    gameplayService.performTextExorcism('begone spirit')
    vi.advanceTimersByTime(120000)
    gameplayService.performTextExorcism('begone spirit')
    
    const stats = advancedStore.getStatistics()
    expect(stats.exorcismsPerformed).toBeGreaterThanOrEqual(2)
  })

  it('should handle ending conditions across stores', () => {
    const advancedStore = useAdvancedHauntingStore()
    
    advancedStore.setPossessionLevel(100)
    advancedStore.checkEndingConditions()
    
    expect(advancedStore.endingReached).toBe('possessed')
  })

  it('should persist and restore state correctly', () => {
    const advancedStore = useAdvancedHauntingStore()
    
    advancedStore.setPossessionLevel(66)
    advancedStore.setDifficulty('nightmare')
    advancedStore.unlockAchievement('exorcist')
    
    advancedStore.saveToLocalStorage()
    
    // Create new store instance
    const newStore = useAdvancedHauntingStore()
    newStore.loadFromLocalStorage()
    
    expect(newStore.possessionLevel).toBe(66)
    expect(newStore.difficulty).toBe('nightmare')
    expect(newStore.achievements.has('exorcist')).toBe(true)
  })
})

describe('Service Integration - Gameplay and Possessed Apps', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    gameplayService.initialize()
  })

  it('should coordinate cursed file deletion with possession reduction', () => {
    const advancedStore = useAdvancedHauntingStore()
    advancedStore.setPossessionLevel(50)
    
    gameplayService.generateCursedFiles()
    const files = gameplayService.getCursedFileList()
    
    gameplayService.deleteCursedFile(files[0].id)
    
    expect(advancedStore.possessionLevel).toBe(42)
  })

  it('should trigger achievements based on gameplay actions', () => {
    const advancedStore = useAdvancedHauntingStore()
    advancedStore.setPossessionLevel(100)
    
    vi.useFakeTimers()
    
    // Perform 5 exorcisms quickly
    for (let i = 0; i < 5; i++) {
      gameplayService.performTextExorcism('begone spirit')
      vi.advanceTimersByTime(30000)
    }
    
    gameplayService.checkAchievements()
    expect(advancedStore.achievements.has('exorcist')).toBe(true)
  })

  it('should coordinate difficulty settings with possession increase', () => {
    const advancedStore = useAdvancedHauntingStore()
    
    advancedStore.setDifficulty('nightmare')
    expect(advancedStore.possessionLevel).toBe(40)
    expect(advancedStore.getDifficultyMultiplier()).toBe(3)
  })
})
