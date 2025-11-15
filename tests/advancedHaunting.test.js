import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAdvancedHauntingStore } from '../src/stores/advancedHaunting.js'

describe('Advanced Haunting Store - Possession Level Calculations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should initialize with possession level 0', () => {
    const store = useAdvancedHauntingStore()
    expect(store.possessionLevel).toBe(0)
  })

  it('should increase possession level correctly', () => {
    const store = useAdvancedHauntingStore()
    store.increasePossession(25)
    expect(store.possessionLevel).toBe(25)
  })

  it('should not exceed possession level 100', () => {
    const store = useAdvancedHauntingStore()
    store.increasePossession(150)
    expect(store.possessionLevel).toBe(100)
  })

  it('should decrease possession level correctly', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    store.decreasePossession(20)
    expect(store.possessionLevel).toBe(30)
  })

  it('should not go below possession level 0', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(10)
    store.decreasePossession(20)
    expect(store.possessionLevel).toBe(0)
  })

  it('should set possession level directly', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(66)
    expect(store.possessionLevel).toBe(66)
  })

  it('should clamp direct set values between 0 and 100', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(-10)
    expect(store.possessionLevel).toBe(0)
    
    store.setPossessionLevel(150)
    expect(store.possessionLevel).toBe(100)
  })
})

describe('Advanced Haunting Store - Difficulty Multipliers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should return 0.5 multiplier for tourist mode', () => {
    const store = useAdvancedHauntingStore()
    store.setDifficulty('tourist')
    expect(store.getDifficultyMultiplier()).toBe(0.5)
  })

  it('should return 1.5 multiplier for normal mode', () => {
    const store = useAdvancedHauntingStore()
    store.setDifficulty('normal')
    expect(store.getDifficultyMultiplier()).toBe(1.5)
  })

  it('should return 3 multiplier for nightmare mode', () => {
    const store = useAdvancedHauntingStore()
    store.setDifficulty('nightmare')
    expect(store.getDifficultyMultiplier()).toBe(3)
  })

  it('should return 1.5 multiplier for permadeath mode', () => {
    const store = useAdvancedHauntingStore()
    store.setDifficulty('permadeath')
    expect(store.getDifficultyMultiplier()).toBe(1.5)
  })

  it('should set initial possession to 40 for nightmare mode', () => {
    const store = useAdvancedHauntingStore()
    store.setDifficulty('nightmare')
    expect(store.possessionLevel).toBe(40)
  })

  it('should default to normal difficulty', () => {
    const store = useAdvancedHauntingStore()
    expect(store.difficulty).toBe('normal')
    expect(store.getDifficultyMultiplier()).toBe(1.5)
  })
})

describe('Advanced Haunting Store - Exorcism Power Calculations', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('should reduce possession by 15 for text exorcism', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    store.performExorcism('text', 15)
    expect(store.possessionLevel).toBe(35)
  })

  it('should reduce possession by 8 for file exorcism', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    store.performExorcism('file', 8)
    expect(store.possessionLevel).toBe(42)
  })

  it('should reduce possession by 20 for puzzle exorcism', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(50)
    store.performExorcism('puzzle', 20)
    expect(store.possessionLevel).toBe(30)
  })

  it('should set exorcism cooldown after performing exorcism', () => {
    const store = useAdvancedHauntingStore()
    store.performExorcism('text', 15)
    expect(store.isExorcismOnCooldown('text')).toBe(true)
  })

  it('should clear cooldown after 120 seconds', () => {
    const store = useAdvancedHauntingStore()
    store.performExorcism('text', 15)
    expect(store.isExorcismOnCooldown('text')).toBe(true)
    
    vi.advanceTimersByTime(120000)
    expect(store.isExorcismOnCooldown('text')).toBe(false)
  })

  it('should track separate cooldowns for different exorcism types', () => {
    const store = useAdvancedHauntingStore()
    store.performExorcism('text', 15)
    store.performExorcism('file', 8)
    
    expect(store.isExorcismOnCooldown('text')).toBe(true)
    expect(store.isExorcismOnCooldown('file')).toBe(true)
    expect(store.isExorcismOnCooldown('puzzle')).toBe(false)
  })
})

describe('Advanced Haunting Store - Achievement Conditions', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('should unlock Exorcist achievement after 5 exorcisms in 180 seconds', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(100)
    
    // Perform 5 exorcisms
    for (let i = 0; i < 5; i++) {
      store.performExorcism('text', 15)
      vi.advanceTimersByTime(30000) // 30 seconds between each
    }
    
    store.checkAchievements()
    expect(store.achievements.has('exorcist')).toBe(true)
  })

  it('should not unlock Exorcist achievement if exorcisms take too long', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(100)
    
    // Perform 5 exorcisms but too slowly
    for (let i = 0; i < 5; i++) {
      store.performExorcism('text', 15)
      vi.advanceTimersByTime(50000) // 50 seconds between each (too slow)
    }
    
    store.checkAchievements()
    expect(store.achievements.has('exorcist')).toBe(false)
  })

  it('should unlock Paranormal Investigator achievement when all easter eggs found', () => {
    const store = useAdvancedHauntingStore()
    
    // Discover all easter eggs
    store.discoverEasterEgg('konami')
    store.discoverEasterEgg('notepad-help')
    store.discoverEasterEgg('coordinate-666')
    store.discoverEasterEgg('possession-66')
    
    store.checkAchievements()
    expect(store.achievements.has('paranormal-investigator')).toBe(true)
  })

  it('should not unlock achievement twice', () => {
    const store = useAdvancedHauntingStore()
    store.unlockAchievement('exorcist')
    
    const initialSize = store.achievements.size
    store.unlockAchievement('exorcist')
    
    expect(store.achievements.size).toBe(initialSize)
  })
})

describe('Advanced Haunting Store - Ending Detection', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  it('should detect Survivor ending after 1800 seconds with possession < 50', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(40)
    
    vi.advanceTimersByTime(1800000) // 30 minutes
    store.checkEndingConditions()
    
    expect(store.endingReached).toBe('survivor')
  })

  it('should not trigger Survivor ending if possession >= 50', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(60)
    
    vi.advanceTimersByTime(1800000)
    store.checkEndingConditions()
    
    expect(store.endingReached).not.toBe('survivor')
  })

  it('should detect Purified ending when possession reaches 0', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(15)
    store.decreasePossession(15)
    
    store.checkEndingConditions()
    expect(store.endingReached).toBe('purified')
  })

  it('should detect Possessed ending when possession reaches 100', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(100)
    
    store.checkEndingConditions()
    expect(store.endingReached).toBe('possessed')
  })

  it('should detect Consumed ending on browser close with possession > 60', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(70)
    
    store.handleBeforeUnload()
    expect(store.endingReached).toBe('consumed')
  })

  it('should not trigger ending twice', () => {
    const store = useAdvancedHauntingStore()
    store.setPossessionLevel(100)
    
    store.checkEndingConditions()
    const firstEnding = store.endingReached
    
    store.checkEndingConditions()
    expect(store.endingReached).toBe(firstEnding)
  })
})
