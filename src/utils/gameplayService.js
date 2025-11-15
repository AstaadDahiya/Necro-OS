/**
 * Gameplay Service
 * 
 * Manages exorcism mechanics, cursed files, achievements, and ending conditions
 * for the Advanced Haunting System.
 */

import { useAdvancedHauntingStore } from '../stores/advancedHaunting'

class GameplayService {
  constructor() {
    this.cursedFiles = []
    this.cursedFileIdCounter = 0
    this.currentPuzzle = null
    this.initialized = false
    this.exorcismHistory = [] // Track recent exorcisms for achievement checking
    
    // Define all achievements
    this.achievementDefinitions = {
      'exorcist': {
        id: 'exorcist',
        name: 'Exorcist',
        description: 'Perform 5 exorcisms within 180 seconds',
        icon: '✝️',
        condition: () => this.checkExorcistCondition()
      },
      'paranormal-investigator': {
        id: 'paranormal-investigator',
        name: 'Paranormal Investigator',
        description: 'Discover all easter eggs',
        icon: '🔍',
        condition: () => this.checkParanormalInvestigatorCondition()
      }
    }
  }

  // ============================================
  // Cursed Files Management
  // ============================================

  /**
   * Generate cursed files (3-7 files with ominous names)
   * Requirements: 3.1
   */
  generateCursedFiles() {
    const count = 3 + Math.floor(Math.random() * 5) // 3-7 files
    
    const possibleNames = [
      'DO_NOT_OPEN.txt',
      'CURSED.exe',
      'YOUR_SOUL.dat',
      'POSSESSED.dll',
      'DAMNED.sys',
      'HAUNTED.log',
      'EVIL.tmp',
      'DARKNESS.bin',
      'VOID.exe',
      'REAPER.dat',
      'TORMENT.txt',
      'SUFFERING.doc',
      'DESPAIR.txt',
      'NIGHTMARE.exe',
      'TERROR.dll'
    ]
    
    // Shuffle and select random files
    const shuffled = [...possibleNames].sort(() => Math.random() - 0.5)
    const selectedNames = shuffled.slice(0, count)
    
    // Create cursed file objects
    this.cursedFiles = selectedNames.map(name => ({
      id: `cursed_${this.cursedFileIdCounter++}`,
      name: name,
      path: `C:\\Cursed\\${name}`,
      type: 'file',
      isCursed: true,
      possessionValue: 8, // Reduction amount when deleted
      createdAt: Date.now()
    }))
    
    console.log(`[GameplayService] Generated ${this.cursedFiles.length} cursed files:`, 
      this.cursedFiles.map(f => f.name))
    
    return this.cursedFiles
  }

  /**
   * Get list of all cursed files
   */
  getCursedFileList() {
    return [...this.cursedFiles]
  }

  /**
   * Get a cursed file by ID
   */
  getCursedFileById(fileId) {
    return this.cursedFiles.find(f => f.id === fileId)
  }

  /**
   * Get a cursed file by name
   */
  getCursedFileByName(fileName) {
    return this.cursedFiles.find(f => f.name === fileName)
  }

  /**
   * Delete a cursed file and reduce possession level
   * Requirements: 3.2, 3.4
   */
  deleteCursedFile(fileId) {
    const fileIndex = this.cursedFiles.findIndex(f => f.id === fileId)
    
    if (fileIndex === -1) {
      console.warn(`[GameplayService] Cursed file not found: ${fileId}`)
      return false
    }
    
    const file = this.cursedFiles[fileIndex]
    const hauntingStore = useAdvancedHauntingStore()
    
    // Check if file deletion is on cooldown
    if (hauntingStore.isExorcismOnCooldown('file')) {
      console.log(`[GameplayService] File exorcism on cooldown`)
      return false
    }
    
    // Remove file from list
    this.cursedFiles.splice(fileIndex, 1)
    
    // Reduce possession level
    const reductionAmount = file.possessionValue
    hauntingStore.decreasePossession(reductionAmount)
    
    // Set cooldown
    hauntingStore.exorcismCooldowns.set('file', Date.now())
    
    // Update statistics
    hauntingStore.statistics.exorcismsPerformed++
    
    // Track exorcism in history
    this.recordExorcism('file')
    
    // Record event in haunting store
    hauntingStore.recordEvent('exorcism_file', {
      fileName: file.name,
      reductionAmount,
      remainingPossession: hauntingStore.possessionLevel
    })
    
    console.log(`[GameplayService] Deleted cursed file "${file.name}", reduced possession by ${reductionAmount}`)
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('cursed-file-deleted', {
      detail: { file, reductionAmount }
    }))
    
    // Check achievements after exorcism
    this.checkAchievements()
    
    return true
  }

  /**
   * Check if a file is cursed by name
   */
  isCursedFile(fileName) {
    return this.cursedFiles.some(f => f.name === fileName)
  }

  // ============================================
  // Exorcism Actions
  // ============================================

  /**
   * Perform text-based exorcism (typing "begone spirit")
   * Requirements: 3.3, 3.4, 3.5
   */
  performTextExorcism(phrase) {
    const hauntingStore = useAdvancedHauntingStore()
    
    // Check if text exorcism is on cooldown
    if (hauntingStore.isExorcismOnCooldown('text')) {
      console.log(`[GameplayService] Text exorcism on cooldown`)
      return false
    }
    
    // Normalize phrase for comparison
    const normalizedPhrase = phrase.toLowerCase().trim()
    
    // Check if phrase matches "begone spirit"
    if (normalizedPhrase === 'begone spirit') {
      // Reduce possession by 15 points
      const reductionAmount = 15
      hauntingStore.decreasePossession(reductionAmount)
      
      // Set cooldown
      hauntingStore.exorcismCooldowns.set('text', Date.now())
      
      // Update statistics
      hauntingStore.statistics.exorcismsPerformed++
      
      // Track exorcism in history
      this.recordExorcism('text')
      
      // Record event in haunting store
      hauntingStore.recordEvent('exorcism_text', {
        phrase,
        reductionAmount,
        remainingPossession: hauntingStore.possessionLevel
      })
      
      console.log(`[GameplayService] Text exorcism performed, reduced possession by ${reductionAmount}`)
      
      // Trigger visual flash effect
      this.triggerExorcismFlash()
      
      // Check for cleansing effect (possession < 30)
      if (hauntingStore.possessionLevel < 30) {
        this.triggerCleansingEffect()
      }
      
      // Dispatch event for UI updates
      window.dispatchEvent(new CustomEvent('text-exorcism-performed', {
        detail: { reductionAmount }
      }))
      
      // Check achievements after exorcism
      this.checkAchievements()
      
      return true
    }
    
    return false
  }

  /**
   * Perform file-based exorcism (deleting cursed file)
   * This is a wrapper around deleteCursedFile for consistency
   * Requirements: 3.2, 3.4
   */
  performFileExorcism(fileId) {
    return this.deleteCursedFile(fileId)
  }

  /**
   * Perform puzzle-based exorcism
   * Requirements: 3.7, 3.8
   */
  performPuzzleExorcism(puzzleId, solution) {
    const hauntingStore = useAdvancedHauntingStore()
    
    // Check if puzzle exorcism is on cooldown
    if (hauntingStore.isExorcismOnCooldown('puzzle')) {
      console.log(`[GameplayService] Puzzle exorcism on cooldown`)
      return { success: false, reason: 'cooldown' }
    }
    
    // Validate puzzle solution
    const isValid = this.validatePuzzleSolution(puzzleId, solution)
    
    if (!isValid) {
      console.log(`[GameplayService] Puzzle solution incorrect`)
      return { success: false, reason: 'incorrect' }
    }
    
    // Reduce possession by 20 points
    const reductionAmount = 20
    hauntingStore.decreasePossession(reductionAmount)
    
    // Set cooldown
    hauntingStore.exorcismCooldowns.set('puzzle', Date.now())
    
    // Update statistics
    hauntingStore.statistics.exorcismsPerformed++
    
    // Track exorcism in history
    this.recordExorcism('puzzle')
    
    // Record event in haunting store
    hauntingStore.recordEvent('exorcism_puzzle', {
      puzzleId,
      reductionAmount,
      remainingPossession: hauntingStore.possessionLevel
    })
    
    console.log(`[GameplayService] Puzzle exorcism performed, reduced possession by ${reductionAmount}`)
    
    // Trigger visual flash effect
    this.triggerExorcismFlash()
    
    // Check for cleansing effect (possession < 30)
    if (hauntingStore.possessionLevel < 30) {
      this.triggerCleansingEffect()
    }
    
    // Dispatch event for UI updates
    window.dispatchEvent(new CustomEvent('puzzle-exorcism-performed', {
      detail: { reductionAmount, puzzleId }
    }))
    
    // Check achievements after exorcism
    this.checkAchievements()
    
    return { success: true, reductionAmount }
  }

  /**
   * Calculate exorcism power based on action type
   */
  calculateExorcismPower(actionType) {
    const powerMap = {
      'text': 15,
      'file': 8,
      'puzzle': 20
    }
    
    return powerMap[actionType] || 0
  }

  /**
   * Check if any exorcism action is on cooldown
   */
  isExorcismOnCooldown(actionType) {
    const hauntingStore = useAdvancedHauntingStore()
    return hauntingStore.isExorcismOnCooldown(actionType)
  }

  /**
   * Get remaining cooldown time in seconds
   */
  getRemainingCooldown(actionType) {
    const hauntingStore = useAdvancedHauntingStore()
    const lastPerformed = hauntingStore.exorcismCooldowns.get(actionType)
    
    if (!lastPerformed) return 0
    
    const cooldownDuration = 120000 // 120 seconds
    const elapsed = Date.now() - lastPerformed
    const remaining = Math.max(0, cooldownDuration - elapsed)
    
    return Math.ceil(remaining / 1000) // Return in seconds
  }

  // ============================================
  // Puzzle System
  // ============================================

  /**
   * Generate a symbol puzzle with 4-6 symbols
   * Requirements: 3.7
   */
  generateSymbolPuzzle(difficulty = 'normal') {
    const symbolSet = ['⛧', '☠', '👁', '🕯', '⚰', '🗡', '🔮', '💀', '👻', '🕷']
    
    // Determine puzzle length based on difficulty
    let length
    if (difficulty === 'easy') {
      length = 4
    } else if (difficulty === 'hard') {
      length = 6
    } else {
      length = 4 + Math.floor(Math.random() * 3) // 4-6 symbols
    }
    
    // Generate random sequence
    const sequence = []
    for (let i = 0; i < length; i++) {
      const randomSymbol = symbolSet[Math.floor(Math.random() * symbolSet.length)]
      sequence.push(randomSymbol)
    }
    
    // Create puzzle object
    const puzzle = {
      id: `puzzle_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      sequence: sequence,
      length: length,
      timeLimit: 30, // 30 seconds
      createdAt: Date.now(),
      difficulty: difficulty
    }
    
    // Store current puzzle
    this.currentPuzzle = puzzle
    
    console.log(`[GameplayService] Generated puzzle:`, puzzle)
    
    return puzzle
  }

  /**
   * Validate puzzle solution
   * Requirements: 3.8
   */
  validatePuzzleSolution(puzzleId, solution) {
    if (!this.currentPuzzle || this.currentPuzzle.id !== puzzleId) {
      console.warn(`[GameplayService] Puzzle not found or expired: ${puzzleId}`)
      return false
    }
    
    // Check if puzzle has expired (30 seconds)
    const elapsed = Date.now() - this.currentPuzzle.createdAt
    if (elapsed > 30000) {
      console.log(`[GameplayService] Puzzle expired`)
      this.currentPuzzle = null
      return false
    }
    
    // Validate solution matches sequence
    if (!Array.isArray(solution)) {
      return false
    }
    
    if (solution.length !== this.currentPuzzle.sequence.length) {
      return false
    }
    
    // Check each symbol matches
    for (let i = 0; i < solution.length; i++) {
      if (solution[i] !== this.currentPuzzle.sequence[i]) {
        return false
      }
    }
    
    console.log(`[GameplayService] Puzzle solution validated successfully`)
    
    // Clear current puzzle
    this.currentPuzzle = null
    
    return true
  }

  /**
   * Get current active puzzle
   */
  getCurrentPuzzle() {
    if (!this.currentPuzzle) {
      return null
    }
    
    // Check if expired
    const elapsed = Date.now() - this.currentPuzzle.createdAt
    if (elapsed > 30000) {
      this.currentPuzzle = null
      return null
    }
    
    return this.currentPuzzle
  }

  /**
   * Cancel current puzzle
   */
  cancelPuzzle() {
    this.currentPuzzle = null
    console.log(`[GameplayService] Puzzle cancelled`)
  }

  // ============================================
  // Visual Effects
  // ============================================

  /**
   * Trigger visual flash effect for exorcism
   * Requirements: 3.3
   */
  triggerExorcismFlash() {
    // Create white flash overlay
    const flash = document.createElement('div')
    flash.style.position = 'fixed'
    flash.style.top = '0'
    flash.style.left = '0'
    flash.style.width = '100vw'
    flash.style.height = '100vh'
    flash.style.backgroundColor = 'white'
    flash.style.opacity = '0.9'
    flash.style.zIndex = '99999'
    flash.style.pointerEvents = 'none'
    flash.style.transition = 'opacity 0.5s ease-out'
    
    document.body.appendChild(flash)
    
    // Fade out and remove after 2 seconds
    setTimeout(() => {
      flash.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(flash)
      }, 500)
    }, 1500)
    
    console.log('[GameplayService] Triggered exorcism flash effect')
  }

  /**
   * Trigger cleansing effect when possession < 30
   * Requirements: 3.5
   */
  triggerCleansingEffect() {
    // Create white light overlay
    const cleansing = document.createElement('div')
    cleansing.style.position = 'fixed'
    cleansing.style.top = '0'
    cleansing.style.left = '0'
    cleansing.style.width = '100vw'
    cleansing.style.height = '100vh'
    cleansing.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)'
    cleansing.style.opacity = '0'
    cleansing.style.zIndex = '99998'
    cleansing.style.pointerEvents = 'none'
    cleansing.style.transition = 'opacity 1s ease-in-out'
    
    document.body.appendChild(cleansing)
    
    // Fade in
    setTimeout(() => {
      cleansing.style.opacity = '1'
    }, 10)
    
    // Fade out and remove after 2 seconds
    setTimeout(() => {
      cleansing.style.opacity = '0'
      setTimeout(() => {
        document.body.removeChild(cleansing)
      }, 1000)
    }, 2000)
    
    console.log('[GameplayService] Triggered cleansing effect (possession < 30)')
  }

  // ============================================
  // Achievement System
  // ============================================

  /**
   * Record an exorcism in history for achievement tracking
   */
  recordExorcism(type) {
    const timestamp = Date.now()
    this.exorcismHistory.push({ type, timestamp })
    
    // Clean up old entries (older than 180 seconds)
    const cutoff = timestamp - 180000
    this.exorcismHistory = this.exorcismHistory.filter(e => e.timestamp > cutoff)
    
    console.log(`[GameplayService] Recorded ${type} exorcism. Recent count: ${this.exorcismHistory.length}`)
  }

  /**
   * Check for "Exorcist" achievement (5 exorcisms within 180 seconds)
   * Requirements: 3.6
   */
  checkExorcistCondition() {
    // Check if we have at least 5 exorcisms in recent history
    if (this.exorcismHistory.length >= 5) {
      // Get the 5 most recent exorcisms
      const recentExorcisms = this.exorcismHistory.slice(-5)
      const oldest = recentExorcisms[0].timestamp
      const newest = recentExorcisms[4].timestamp
      const timeWindow = newest - oldest
      
      // Check if they're within 180 seconds
      if (timeWindow <= 180000) {
        console.log(`[GameplayService] Exorcist achievement condition met! (${timeWindow}ms window)`)
        return true
      }
    }
    
    return false
  }

  /**
   * Check for "Paranormal Investigator" achievement (discover all easter eggs)
   * Requirements: 8.5, 8.6
   */
  checkParanormalInvestigatorCondition() {
    const hauntingStore = useAdvancedHauntingStore()
    
    // Define all easter egg IDs
    const allEasterEggs = [
      'konami-code',
      'notepad-help',
      'possession-66',
      'secret-coordinate'
    ]
    
    // Check if all easter eggs have been discovered
    const discoveredCount = allEasterEggs.filter(eggId => 
      hauntingStore.discoveredEasterEggs.has(eggId)
    ).length
    
    if (discoveredCount === allEasterEggs.length) {
      console.log(`[GameplayService] Paranormal Investigator achievement condition met! (${discoveredCount}/${allEasterEggs.length} easter eggs)`)
      return true
    }
    
    return false
  }

  /**
   * Unlock an achievement
   * Requirements: 3.6, 6.5
   */
  unlockAchievement(achievementId) {
    const hauntingStore = useAdvancedHauntingStore()
    
    // Check if achievement exists
    if (!this.achievementDefinitions[achievementId]) {
      console.warn(`[GameplayService] Unknown achievement: ${achievementId}`)
      return false
    }
    
    // Check if already unlocked
    if (hauntingStore.achievements.has(achievementId)) {
      console.log(`[GameplayService] Achievement already unlocked: ${achievementId}`)
      return false
    }
    
    const achievement = this.achievementDefinitions[achievementId]
    
    // Add achievement with timestamp
    hauntingStore.achievements.add(achievementId)
    
    // Update statistics
    hauntingStore.statistics.achievementsUnlocked++
    
    // Record event in haunting store
    hauntingStore.recordEvent('achievement_unlocked', {
      achievementId,
      name: achievement.name,
      description: achievement.description
    })
    
    console.log(`[GameplayService] 🏆 Achievement unlocked: ${achievement.name}`)
    
    // Dispatch event for UI notification
    window.dispatchEvent(new CustomEvent('achievement-unlocked', {
      detail: { 
        achievementId,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        timestamp: Date.now()
      }
    }))
    
    // Save to localStorage
    hauntingStore.saveToLocalStorage()
    
    return true
  }

  /**
   * Check all achievement conditions
   * Requirements: 3.6, 8.6
   */
  checkAchievements() {
    // Check each achievement condition
    for (const [achievementId, achievement] of Object.entries(this.achievementDefinitions)) {
      // Skip if already unlocked
      const hauntingStore = useAdvancedHauntingStore()
      if (hauntingStore.achievements.has(achievementId)) {
        continue
      }
      
      // Check condition
      if (achievement.condition()) {
        this.unlockAchievement(achievementId)
      }
    }
  }

  /**
   * Get all achievement definitions
   */
  getAllAchievements() {
    return Object.values(this.achievementDefinitions)
  }

  /**
   * Get achievement by ID
   */
  getAchievement(achievementId) {
    return this.achievementDefinitions[achievementId] || null
  }

  /**
   * Check if achievement is unlocked
   */
  isAchievementUnlocked(achievementId) {
    const hauntingStore = useAdvancedHauntingStore()
    return hauntingStore.achievements.has(achievementId)
  }

  /**
   * Get unlocked achievements
   */
  getUnlockedAchievements() {
    const hauntingStore = useAdvancedHauntingStore()
    return Array.from(hauntingStore.achievements).map(id => this.achievementDefinitions[id]).filter(Boolean)
  }

  /**
   * Get achievement progress
   */
  getAchievementProgress() {
    const hauntingStore = useAdvancedHauntingStore()
    const total = Object.keys(this.achievementDefinitions).length
    const unlocked = hauntingStore.achievements.size
    
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0
    }
  }

  // ============================================
  // Initialization
  // ============================================

  /**
   * Initialize the gameplay service
   */
  initialize() {
    if (this.initialized) {
      console.warn('[GameplayService] Already initialized')
      return
    }
    
    console.log('[GameplayService] Initializing gameplay service')
    
    // Generate initial cursed files
    this.generateCursedFiles()
    
    // Listen for easter egg discoveries to check achievements
    window.addEventListener('easter-egg-discovered', () => {
      this.checkAchievements()
    })
    
    this.initialized = true
    
    console.log('[GameplayService] Gameplay service initialized')
  }

  /**
   * Reset the gameplay service
   */
  reset() {
    this.cursedFiles = []
    this.cursedFileIdCounter = 0
    this.initialized = false
    
    console.log('[GameplayService] Gameplay service reset')
  }
}

// Export singleton instance
export const gameplayService = new GameplayService()
export default gameplayService
