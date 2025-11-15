import { defineStore } from 'pinia'
import { watch } from 'vue'
import { useGhostBehaviorStore } from './ghostBehavior'
import { useVisualCorruptionStore } from './visualCorruption'

export const useAdvancedHauntingStore = defineStore('advancedHaunting', {
  state: () => ({
    // Core possession level (0-100)
    possessionLevel: 0,
    
    // Difficulty mode
    difficulty: 'normal', // 'tourist' | 'normal' | 'nightmare' | 'permadeath'
    
    // Session tracking
    sessionStartTime: null,
    
    // Exorcism cooldowns (Map of action type to timestamp)
    exorcismCooldowns: new Map(),
    
    // Discovered easter eggs (Set of egg IDs)
    discoveredEasterEggs: new Set(),
    
    // Achievements (Set of achievement IDs)
    achievements: new Set(),
    
    // Ending reached
    endingReached: null, // null | 'survivor' | 'consumed' | 'purified' | 'possessed'
    
    // Customization settings
    customization: {
      scareIntensity: 100, // 0-100
      enabledBehaviors: new Set(['possessedApps', 'audioHaunting', 'visualCorruption']),
      theme: 'default', // 'default' | 'hospital' | 'asylum' | 'cemetery'
      reducedMotion: false, // Accessibility: reduce flashing and rapid animations
      visualCuesForAudio: true // Accessibility: show visual indicators for audio events
    },
    
    // Statistics
    statistics: {
      totalSessions: 0,
      totalTimeSurvived: 0,
      exorcismsPerformed: 0,
      jumpscaresSeen: new Set(),
      // Additional event tracking
      eventsHistory: [], // Array of {type, timestamp, data}
      maxPossessionReached: 0,
      totalPossessionIncreases: 0,
      totalPossessionDecreases: 0,
      achievementsUnlocked: 0,
      easterEggsFound: 0,
      endingsReached: new Set()
    },
    
    // Internal timers
    _possessionTimer: null,
    _saveDebounceTimer: null,
    _lastPossessionUpdate: null,
    _whisperTimer: null,
    _heartbeatActive: false,
    
    // User name detection
    detectedUserName: null,
    
    // Performance monitoring
    _lastPossessionUpdateTime: 0,
    _possessionUpdateThrottle: 1000, // Max 1 update per second
    _performanceMonitor: {
      fps: 60,
      lastFrameTime: 0,
      frameCount: 0,
      fpsCheckInterval: null,
      effectsReduced: false
    }
  }),

  getters: {
    // Get current possession level
    currentPossessionLevel: (state) => state.possessionLevel,
    
    // Check if feature is enabled
    isFeatureEnabled: (state) => (featureType) => {
      return state.customization.enabledBehaviors.has(featureType)
    },
    
    // Get difficulty multiplier
    difficultyMultiplier: (state) => {
      switch (state.difficulty) {
        case 'tourist':
          return 0.5
        case 'normal':
          return 1.5
        case 'nightmare':
          return 3.0
        case 'permadeath':
          return 1.5
        default:
          return 1.5
      }
    },
    
    // Get possession increase rate per minute
    possessionIncreaseRate: (state) => {
      const baseRate = state.difficultyMultiplier
      return baseRate // points per minute
    },
    
    // Check if exorcism is on cooldown
    isExorcismOnCooldown: (state) => (actionType) => {
      const lastPerformed = state.exorcismCooldowns.get(actionType)
      if (!lastPerformed) return false
      
      const cooldownDuration = 120000 // 120 seconds
      return Date.now() - lastPerformed < cooldownDuration
    }
  },

  actions: {
    // ============================================
    // Core Possession Management
    // ============================================
    
    increasePossession(amount) {
      // Throttle possession updates to max 1 per second
      const now = Date.now()
      if (now - this._lastPossessionUpdateTime < this._possessionUpdateThrottle) {
        // Queue the update for later
        if (!this._queuedPossessionIncrease) {
          this._queuedPossessionIncrease = 0
        }
        this._queuedPossessionIncrease += amount
        return this.possessionLevel
      }
      
      // Apply queued updates if any
      if (this._queuedPossessionIncrease) {
        amount += this._queuedPossessionIncrease
        this._queuedPossessionIncrease = 0
      }
      
      const oldLevel = this.possessionLevel
      this.possessionLevel = Math.min(100, this.possessionLevel + amount)
      
      if (this.possessionLevel !== oldLevel) {
        console.log(`[AdvancedHaunting] Possession increased by ${amount} to ${this.possessionLevel}`)
        
        // Track statistics
        this.statistics.totalPossessionIncreases++
        if (this.possessionLevel > this.statistics.maxPossessionReached) {
          this.statistics.maxPossessionReached = this.possessionLevel
        }
        
        // Record event
        this.recordEvent('possession_increase', { 
          amount, 
          oldLevel, 
          newLevel: this.possessionLevel 
        })
        
        this.debouncedSave()
        this._lastPossessionUpdateTime = now
      }
      
      return this.possessionLevel
    },
    
    decreasePossession(amount) {
      // Throttle possession updates to max 1 per second
      const now = Date.now()
      if (now - this._lastPossessionUpdateTime < this._possessionUpdateThrottle) {
        // Queue the update for later
        if (!this._queuedPossessionDecrease) {
          this._queuedPossessionDecrease = 0
        }
        this._queuedPossessionDecrease += amount
        return this.possessionLevel
      }
      
      // Apply queued updates if any
      if (this._queuedPossessionDecrease) {
        amount += this._queuedPossessionDecrease
        this._queuedPossessionDecrease = 0
      }
      
      const oldLevel = this.possessionLevel
      this.possessionLevel = Math.max(0, this.possessionLevel - amount)
      
      if (this.possessionLevel !== oldLevel) {
        console.log(`[AdvancedHaunting] Possession decreased by ${amount} to ${this.possessionLevel}`)
        
        // Track statistics
        this.statistics.totalPossessionDecreases++
        
        // Record event
        this.recordEvent('possession_decrease', { 
          amount, 
          oldLevel, 
          newLevel: this.possessionLevel 
        })
        
        this.debouncedSave()
        this._lastPossessionUpdateTime = now
      }
      
      return this.possessionLevel
    },
    
    setPossessionLevel(level) {
      this.possessionLevel = Math.max(0, Math.min(100, level))
      this.debouncedSave()
    },

    // ============================================
    // Difficulty Management
    // ============================================
    
    setDifficulty(mode) {
      if (!['tourist', 'normal', 'nightmare', 'permadeath'].includes(mode)) {
        console.error(`[AdvancedHaunting] Invalid difficulty mode: ${mode}`)
        return
      }
      
      this.difficulty = mode
      console.log(`[AdvancedHaunting] Difficulty set to ${mode}`)
      
      // Set initial possession level for nightmare mode
      if (mode === 'nightmare' && this.possessionLevel === 0) {
        this.possessionLevel = 40
      }
      
      this.saveToLocalStorage()
    },
    
    getDifficultyMultiplier() {
      return this.difficultyMultiplier
    },

    // ============================================
    // Session Management
    // ============================================
    
    startSession() {
      this.sessionStartTime = Date.now()
      this.statistics.totalSessions++
      
      console.log(`[AdvancedHaunting] Session started (total sessions: ${this.statistics.totalSessions})`)
      
      // Record session start event
      this.recordEvent('session_start', {
        sessionNumber: this.statistics.totalSessions,
        difficulty: this.difficulty,
        initialPossession: this.possessionLevel
      })
      
      // Start possession escalation timer
      this.startPossessionEscalation()
      
      this.saveToLocalStorage()
    },
    
    endSession() {
      if (this.sessionStartTime) {
        const sessionDuration = Date.now() - this.sessionStartTime
        this.statistics.totalTimeSurvived += sessionDuration
        
        console.log(`[AdvancedHaunting] Session ended (duration: ${Math.round(sessionDuration / 1000)}s)`)
        
        // Record session end event
        this.recordEvent('session_end', {
          duration: Math.round(sessionDuration / 1000),
          finalPossession: this.possessionLevel,
          exorcismsPerformed: this.statistics.exorcismsPerformed,
          ending: this.endingReached
        })
      }
      
      this.stopPossessionEscalation()
      this.saveToLocalStorage()
    },
    
    startPossessionEscalation() {
      // Clear any existing timer
      if (this._possessionTimer) {
        clearInterval(this._possessionTimer)
      }
      
      // Update possession level every 60 seconds
      this._possessionTimer = setInterval(() => {
        const baseAmount = this.possessionIncreaseRate
        // Apply seasonal modifiers
        const modifiedAmount = this.applySeasonalModifiers(baseAmount)
        this.increasePossession(modifiedAmount)
      }, 60000) // 60 seconds
      
      console.log(`[AdvancedHaunting] Possession escalation started (${this.possessionIncreaseRate} points/min)`)
    },
    
    stopPossessionEscalation() {
      if (this._possessionTimer) {
        clearInterval(this._possessionTimer)
        this._possessionTimer = null
        console.log('[AdvancedHaunting] Possession escalation stopped')
      }
    },

    // ============================================
    // Statistics Tracking
    // ============================================
    
    recordEvent(eventType, data = {}) {
      const event = {
        type: eventType,
        timestamp: Date.now(),
        data
      }
      
      // Add to events history
      this.statistics.eventsHistory.push(event)
      
      // Limit events history to last 100 events to prevent memory issues
      if (this.statistics.eventsHistory.length > 100) {
        this.statistics.eventsHistory = this.statistics.eventsHistory.slice(-100)
      }
      
      console.log(`[AdvancedHaunting] Event recorded: ${eventType}`, data)
    },
    
    getStatistics() {
      // Calculate session duration
      const currentSessionDuration = this.sessionStartTime 
        ? Date.now() - this.sessionStartTime 
        : 0
      
      // Format time survived
      const totalTime = this.statistics.totalTimeSurvived + currentSessionDuration
      const hours = Math.floor(totalTime / (1000 * 60 * 60))
      const minutes = Math.floor((totalTime % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((totalTime % (1000 * 60)) / 1000)
      
      return {
        // Session stats
        totalSessions: this.statistics.totalSessions,
        currentSessionDuration: Math.floor(currentSessionDuration / 1000), // in seconds
        totalTimeSurvived: Math.floor(totalTime / 1000), // in seconds
        totalTimeSurvivedFormatted: `${hours}h ${minutes}m ${seconds}s`,
        
        // Possession stats
        currentPossessionLevel: this.possessionLevel,
        maxPossessionReached: this.statistics.maxPossessionReached,
        totalPossessionIncreases: this.statistics.totalPossessionIncreases,
        totalPossessionDecreases: this.statistics.totalPossessionDecreases,
        
        // Gameplay stats
        exorcismsPerformed: this.statistics.exorcismsPerformed,
        jumpscaresSeen: this.statistics.jumpscaresSeen.size,
        achievementsUnlocked: this.statistics.achievementsUnlocked,
        easterEggsFound: this.statistics.easterEggsFound,
        endingsReached: Array.from(this.statistics.endingsReached),
        
        // Current state
        difficulty: this.difficulty,
        endingReached: this.endingReached,
        
        // Recent events (last 10)
        recentEvents: this.statistics.eventsHistory.slice(-10).map(event => ({
          type: event.type,
          timestamp: new Date(event.timestamp).toLocaleTimeString(),
          data: event.data
        }))
      }
    },

    // ============================================
    // Persistence Methods
    // ============================================
    
    saveToLocalStorage() {
      try {
        const data = {
          possessionLevel: this.possessionLevel,
          difficulty: this.difficulty,
          sessionStartTime: this.sessionStartTime,
          exorcismCooldowns: Array.from(this.exorcismCooldowns.entries()),
          discoveredEasterEggs: Array.from(this.discoveredEasterEggs),
          achievements: Array.from(this.achievements),
          endingReached: this.endingReached,
          customization: {
            scareIntensity: this.customization.scareIntensity,
            enabledBehaviors: Array.from(this.customization.enabledBehaviors),
            theme: this.customization.theme,
            reducedMotion: this.customization.reducedMotion,
            visualCuesForAudio: this.customization.visualCuesForAudio
          },
          statistics: {
            totalSessions: this.statistics.totalSessions,
            totalTimeSurvived: this.statistics.totalTimeSurvived,
            exorcismsPerformed: this.statistics.exorcismsPerformed,
            jumpscaresSeen: Array.from(this.statistics.jumpscaresSeen),
            eventsHistory: this.statistics.eventsHistory,
            maxPossessionReached: this.statistics.maxPossessionReached,
            totalPossessionIncreases: this.statistics.totalPossessionIncreases,
            totalPossessionDecreases: this.statistics.totalPossessionDecreases,
            achievementsUnlocked: this.statistics.achievementsUnlocked,
            easterEggsFound: this.statistics.easterEggsFound,
            endingsReached: Array.from(this.statistics.endingsReached)
          }
        }
        
        const jsonString = JSON.stringify(data)
        
        try {
          // Try to save normally
          localStorage.setItem('necro-os-advanced-haunting', jsonString)
          console.log('[AdvancedHaunting] Progress saved to localStorage')
        } catch (quotaError) {
          // If quota exceeded, try compression
          if (quotaError.name === 'QuotaExceededError') {
            console.warn('[AdvancedHaunting] localStorage quota exceeded, compressing data...')
            
            // Compress by removing events history
            const compressedData = {
              ...data,
              statistics: {
                ...data.statistics,
                eventsHistory: [] // Remove events history to save space
              }
            }
            
            try {
              localStorage.setItem('necro-os-advanced-haunting', JSON.stringify(compressedData))
              console.log('[AdvancedHaunting] Progress saved with compression (events history removed)')
            } catch (finalError) {
              console.error('[AdvancedHaunting] Failed to save even with compression:', finalError)
              
              // As last resort, try to save only critical data
              const minimalData = {
                possessionLevel: this.possessionLevel,
                difficulty: this.difficulty,
                statistics: {
                  totalSessions: this.statistics.totalSessions,
                  totalTimeSurvived: this.statistics.totalTimeSurvived,
                  exorcismsPerformed: this.statistics.exorcismsPerformed
                }
              }
              
              try {
                localStorage.setItem('necro-os-advanced-haunting', JSON.stringify(minimalData))
                console.log('[AdvancedHaunting] Progress saved with minimal data only')
              } catch (criticalError) {
                console.error('[AdvancedHaunting] Critical: Unable to save any data to localStorage:', criticalError)
              }
            }
          } else {
            throw quotaError
          }
        }
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to save to localStorage:', error)
      }
    },
    
    debouncedSave() {
      // Clear existing debounce timer
      if (this._saveDebounceTimer) {
        clearTimeout(this._saveDebounceTimer)
      }
      
      // Save after 5 seconds of inactivity
      this._saveDebounceTimer = setTimeout(() => {
        this.saveToLocalStorage()
      }, 5000)
    },

    loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('necro-os-advanced-haunting')
        if (!saved) {
          console.log('[AdvancedHaunting] No saved data found')
          return false
        }
        
        const data = JSON.parse(saved)
        
        // Validate data structure
        if (!data || typeof data !== 'object') {
          console.error('[AdvancedHaunting] Invalid data structure in localStorage')
          return false
        }
        
        // Validate and restore possession level
        if (typeof data.possessionLevel === 'number' && !isNaN(data.possessionLevel)) {
          this.possessionLevel = Math.max(0, Math.min(100, data.possessionLevel))
        }
        
        // Validate and restore difficulty
        if (data.difficulty && ['tourist', 'normal', 'nightmare', 'permadeath'].includes(data.difficulty)) {
          this.difficulty = data.difficulty
        }
        
        // Validate and restore session start time
        if (typeof data.sessionStartTime === 'number' && data.sessionStartTime > 0) {
          this.sessionStartTime = data.sessionStartTime
        }
        
        // Validate and restore exorcism cooldowns
        if (Array.isArray(data.exorcismCooldowns)) {
          try {
            this.exorcismCooldowns = new Map(data.exorcismCooldowns.filter(
              ([key, value]) => typeof key === 'string' && typeof value === 'number'
            ))
          } catch (e) {
            console.warn('[AdvancedHaunting] Failed to restore exorcism cooldowns:', e)
          }
        }
        
        // Validate and restore discovered easter eggs
        if (Array.isArray(data.discoveredEasterEggs)) {
          this.discoveredEasterEggs = new Set(data.discoveredEasterEggs.filter(
            egg => typeof egg === 'string'
          ))
        }
        
        // Validate and restore achievements
        if (Array.isArray(data.achievements)) {
          this.achievements = new Set(data.achievements.filter(
            achievement => typeof achievement === 'string'
          ))
        }
        
        // Validate and restore ending reached
        if (data.endingReached && ['survivor', 'consumed', 'purified', 'possessed'].includes(data.endingReached)) {
          this.endingReached = data.endingReached
        }
        
        // Validate and restore customization
        if (data.customization && typeof data.customization === 'object') {
          if (typeof data.customization.scareIntensity === 'number' && !isNaN(data.customization.scareIntensity)) {
            this.customization.scareIntensity = Math.max(0, Math.min(100, data.customization.scareIntensity))
          }
          
          if (Array.isArray(data.customization.enabledBehaviors)) {
            const validBehaviors = ['possessedApps', 'audioHaunting', 'visualCorruption']
            this.customization.enabledBehaviors = new Set(
              data.customization.enabledBehaviors.filter(b => validBehaviors.includes(b))
            )
          }
          
          if (data.customization.theme && ['default', 'hospital', 'asylum', 'cemetery'].includes(data.customization.theme)) {
            this.customization.theme = data.customization.theme
          }
          
          if (typeof data.customization.reducedMotion === 'boolean') {
            this.customization.reducedMotion = data.customization.reducedMotion
          }
          
          if (typeof data.customization.visualCuesForAudio === 'boolean') {
            this.customization.visualCuesForAudio = data.customization.visualCuesForAudio
          }
        }
        
        // Validate and restore statistics
        if (data.statistics && typeof data.statistics === 'object') {
          // Basic statistics
          if (typeof data.statistics.totalSessions === 'number' && !isNaN(data.statistics.totalSessions)) {
            this.statistics.totalSessions = Math.max(0, data.statistics.totalSessions)
          }
          
          if (typeof data.statistics.totalTimeSurvived === 'number' && !isNaN(data.statistics.totalTimeSurvived)) {
            this.statistics.totalTimeSurvived = Math.max(0, data.statistics.totalTimeSurvived)
          }
          
          if (typeof data.statistics.exorcismsPerformed === 'number' && !isNaN(data.statistics.exorcismsPerformed)) {
            this.statistics.exorcismsPerformed = Math.max(0, data.statistics.exorcismsPerformed)
          }
          
          // Jumpscares seen
          if (Array.isArray(data.statistics.jumpscaresSeen)) {
            this.statistics.jumpscaresSeen = new Set(data.statistics.jumpscaresSeen.filter(
              id => typeof id === 'string'
            ))
          }
          
          // Events history
          if (Array.isArray(data.statistics.eventsHistory)) {
            this.statistics.eventsHistory = data.statistics.eventsHistory.filter(
              event => event && typeof event === 'object' && event.type && event.timestamp
            ).slice(-100) // Keep only last 100 events
          }
          
          // Max possession reached
          if (typeof data.statistics.maxPossessionReached === 'number' && !isNaN(data.statistics.maxPossessionReached)) {
            this.statistics.maxPossessionReached = Math.max(0, Math.min(100, data.statistics.maxPossessionReached))
          }
          
          // Possession changes
          if (typeof data.statistics.totalPossessionIncreases === 'number' && !isNaN(data.statistics.totalPossessionIncreases)) {
            this.statistics.totalPossessionIncreases = Math.max(0, data.statistics.totalPossessionIncreases)
          }
          
          if (typeof data.statistics.totalPossessionDecreases === 'number' && !isNaN(data.statistics.totalPossessionDecreases)) {
            this.statistics.totalPossessionDecreases = Math.max(0, data.statistics.totalPossessionDecreases)
          }
          
          // Achievements and easter eggs
          if (typeof data.statistics.achievementsUnlocked === 'number' && !isNaN(data.statistics.achievementsUnlocked)) {
            this.statistics.achievementsUnlocked = Math.max(0, data.statistics.achievementsUnlocked)
          }
          
          if (typeof data.statistics.easterEggsFound === 'number' && !isNaN(data.statistics.easterEggsFound)) {
            this.statistics.easterEggsFound = Math.max(0, data.statistics.easterEggsFound)
          }
          
          // Endings reached
          if (Array.isArray(data.statistics.endingsReached)) {
            const validEndings = ['survivor', 'consumed', 'purified', 'possessed']
            this.statistics.endingsReached = new Set(
              data.statistics.endingsReached.filter(e => validEndings.includes(e))
            )
          }
        }
        
        console.log('[AdvancedHaunting] Progress loaded from localStorage')
        console.log('[AdvancedHaunting] Loaded statistics:', this.getStatistics())
        return true
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to load from localStorage:', error)
        
        // If JSON parsing failed, try to clear corrupted data
        if (error instanceof SyntaxError) {
          console.warn('[AdvancedHaunting] Corrupted data detected, clearing localStorage')
          try {
            localStorage.removeItem('necro-os-advanced-haunting')
          } catch (e) {
            console.error('[AdvancedHaunting] Failed to clear corrupted data:', e)
          }
        }
        
        return false
      }
    },

    clearProgress() {
      try {
        localStorage.removeItem('necro-os-advanced-haunting')
        
        // Reset state to defaults
        this.possessionLevel = 0
        this.difficulty = 'normal'
        this.sessionStartTime = null
        this.exorcismCooldowns.clear()
        this.discoveredEasterEggs.clear()
        this.achievements.clear()
        this.endingReached = null
        this.customization = {
          scareIntensity: 100,
          enabledBehaviors: new Set(['possessedApps', 'audioHaunting', 'visualCorruption']),
          theme: 'default',
          reducedMotion: false,
          visualCuesForAudio: true
        }
        this.statistics = {
          totalSessions: 0,
          totalTimeSurvived: 0,
          exorcismsPerformed: 0,
          jumpscaresSeen: new Set(),
          eventsHistory: [],
          maxPossessionReached: 0,
          totalPossessionIncreases: 0,
          totalPossessionDecreases: 0,
          achievementsUnlocked: 0,
          easterEggsFound: 0,
          endingsReached: new Set()
        }
        
        console.log('[AdvancedHaunting] Progress cleared')
        this.recordEvent('progress_cleared', {})
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to clear progress:', error)
      }
    },

    // ============================================
    // Customization Methods
    // ============================================
    
    /**
     * Update customization settings
     * Requirements: 10.6
     * @param {Object} settings - Customization settings
     */
    updateCustomization(settings) {
      try {
        // Update scare intensity
        if (typeof settings.scareIntensity === 'number' && !isNaN(settings.scareIntensity)) {
          this.customization.scareIntensity = Math.max(0, Math.min(100, settings.scareIntensity))
          console.log(`[AdvancedHaunting] Scare intensity updated to ${this.customization.scareIntensity}%`)
        }
        
        // Update enabled behaviors
        if (Array.isArray(settings.enabledBehaviors)) {
          const validBehaviors = ['possessedApps', 'audioHaunting', 'visualCorruption']
          this.customization.enabledBehaviors = new Set(
            settings.enabledBehaviors.filter(b => validBehaviors.includes(b))
          )
          console.log('[AdvancedHaunting] Enabled behaviors updated:', Array.from(this.customization.enabledBehaviors))
        }
        
        // Update theme
        if (settings.theme && ['default', 'hospital', 'asylum', 'cemetery'].includes(settings.theme)) {
          this.customization.theme = settings.theme
          console.log(`[AdvancedHaunting] Theme updated to ${this.customization.theme}`)
          
          // Apply theme to document
          this.applyTheme(settings.theme)
        }
        
        // Update reduced motion
        if (typeof settings.reducedMotion === 'boolean') {
          this.customization.reducedMotion = settings.reducedMotion
          console.log(`[AdvancedHaunting] Reduced motion updated to ${this.customization.reducedMotion}`)
          
          // Apply reduced motion class to body
          if (settings.reducedMotion) {
            document.body.classList.add('reduced-motion')
          } else {
            document.body.classList.remove('reduced-motion')
          }
        }
        
        // Update visual cues for audio
        if (typeof settings.visualCuesForAudio === 'boolean') {
          this.customization.visualCuesForAudio = settings.visualCuesForAudio
          console.log(`[AdvancedHaunting] Visual cues for audio updated to ${this.customization.visualCuesForAudio}`)
        }
        
        // Record event
        this.recordEvent('customization_updated', {
          scareIntensity: this.customization.scareIntensity,
          enabledBehaviors: Array.from(this.customization.enabledBehaviors),
          theme: this.customization.theme,
          reducedMotion: this.customization.reducedMotion,
          visualCuesForAudio: this.customization.visualCuesForAudio
        })
        
        // Save to localStorage
        this.saveToLocalStorage()
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to update customization:', error)
      }
    },
    
    /**
     * Apply theme to document
     * Requirements: 10.4
     * @param {string} theme - Theme name
     */
    applyTheme(theme) {
      try {
        // Remove existing theme classes
        document.body.classList.remove('theme-default', 'theme-hospital', 'theme-asylum', 'theme-cemetery')
        
        // Add new theme class
        document.body.classList.add(`theme-${theme}`)
        
        console.log(`[AdvancedHaunting] Applied theme: ${theme}`)
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to apply theme:', error)
      }
    },

    // ============================================
    // User Name Detection
    // ============================================
    
    detectUserName(inputValue) {
      // Simple heuristic: if input looks like a name (2-30 chars, mostly letters)
      if (!inputValue || typeof inputValue !== 'string') return
      
      const trimmed = inputValue.trim()
      
      // Check if it looks like a name (2-30 characters, mostly letters)
      if (trimmed.length >= 2 && trimmed.length <= 30) {
        const letterCount = (trimmed.match(/[a-zA-Z]/g) || []).length
        const letterRatio = letterCount / trimmed.length
        
        // If more than 70% letters, consider it a potential name
        if (letterRatio > 0.7) {
          this.detectedUserName = trimmed
          console.log(`[AdvancedHaunting] Detected user name: ${trimmed}`)
          this.debouncedSave()
        }
      }
    },
    
    // Setup global input listener for name detection
    setupUserNameDetection() {
      // Listen to all input events across the application
      document.addEventListener('input', (event) => {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
          this.detectUserName(event.target.value)
          
          // Also check for text exorcism phrase
          this.checkTextExorcism(event.target.value)
        }
      })
      
      console.log('[AdvancedHaunting] User name detection initialized')
    },
    
    // Check for text exorcism phrase in input
    async checkTextExorcism(inputValue) {
      if (!inputValue || typeof inputValue !== 'string') return
      
      try {
        // Dynamically import gameplay service
        const { gameplayService } = await import('../utils/gameplayService.js')
        
        // Check if input contains "begone spirit"
        if (inputValue.toLowerCase().includes('begone spirit')) {
          gameplayService.performTextExorcism(inputValue)
        }
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to check text exorcism:', error)
      }
    },

    // ============================================
    // Audio Haunting Integration
    // ============================================
    
    async initializeAudioHaunting() {
      try {
        // Dynamically import audio haunting service
        const { audioHauntingService } = await import('../utils/audioHauntingService.js')
        
        // Initialize audio layers
        await audioHauntingService.initializeAudioLayers()
        
        // Watch possession level and trigger audio effects
        watch(
          () => this.possessionLevel,
          async (level) => {
            // Update audio volumes based on possession level
            audioHauntingService.updateAudioForPossessionLevel(level)
            
            // Trigger whispers when possession > 70 and user name available
            if (level > 70 && this.detectedUserName && !this._whisperTimer) {
              this.startWhisperLoop(audioHauntingService)
            } else if (level <= 70 && this._whisperTimer) {
              this.stopWhisperLoop()
            }
            
            // Start continuous heartbeat when possession > 80
            if (level > 80 && !this._heartbeatActive) {
              await audioHauntingService.startContinuousHeartbeat(100)
              this._heartbeatActive = true
              console.log('[AdvancedHaunting] Started continuous heartbeat (possession > 80)')
            } else if (level <= 80 && this._heartbeatActive) {
              audioHauntingService.stopHeartbeat()
              this._heartbeatActive = false
              console.log('[AdvancedHaunting] Stopped continuous heartbeat (possession <= 80)')
            }
          },
          { immediate: true }
        )
        
        console.log('[AdvancedHaunting] Audio haunting integration initialized')
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to initialize audio haunting:', error)
      }
    },
    
    async initializeMetaHorrorEffects() {
      try {
        // Dynamically import meta horror service
        const { metaHorrorService } = await import('../utils/metaHorrorService.js')
        
        // Watch possession level and trigger meta horror effects
        watch(
          () => this.possessionLevel,
          async (level, oldLevel) => {
            // Trigger watching notification when possession > 75
            if (level > 75 && oldLevel <= 75) {
              // Trigger with a random delay (5-15 seconds) for unpredictability
              const delay = 5000 + Math.random() * 10000
              setTimeout(() => {
                if (this.possessionLevel > 75) {
                  metaHorrorService.showWatchingNotification(this.possessionLevel)
                }
              }, delay)
            }
            
            // Randomly trigger other meta horror effects based on possession level
            if (level > 45 && Math.random() < 0.1) {
              // 10% chance to trigger random effect when possession changes
              metaHorrorService.triggerRandomEffect(level)
            }
          }
        )
        
        console.log('[AdvancedHaunting] Meta horror effects integration initialized')
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to initialize meta horror effects:', error)
      }
    },
    
    startWhisperLoop(audioHauntingService) {
      // Play whispers at random intervals (30-90 seconds)
      const playWhisper = async () => {
        if (this.possessionLevel > 70 && this.detectedUserName) {
          await audioHauntingService.playWhisper(this.detectedUserName)
        }
        
        // Schedule next whisper
        if (this._whisperTimer) {
          const nextInterval = 30000 + Math.random() * 60000 // 30-90 seconds
          this._whisperTimer = setTimeout(playWhisper, nextInterval)
        }
      }
      
      // Start the loop
      playWhisper()
      console.log('[AdvancedHaunting] Started whisper loop')
    },
    
    stopWhisperLoop() {
      if (this._whisperTimer) {
        clearTimeout(this._whisperTimer)
        this._whisperTimer = null
        console.log('[AdvancedHaunting] Stopped whisper loop')
      }
    },
    
    // Trigger heartbeat ramp before jumpscare
    async triggerJumpscareHeartbeat() {
      try {
        const { audioHauntingService } = await import('../utils/audioHauntingService.js')
        
        // Start heartbeat at 60 BPM
        await audioHauntingService.startHeartbeat(60)
        
        // Ramp to 140 BPM over 10 seconds
        audioHauntingService.adjustHeartbeatTempo(140, 10)
        
        console.log('[AdvancedHaunting] Triggered jumpscare heartbeat ramp')
        
        // Stop heartbeat after jumpscare (after 10 seconds + 2 second buffer)
        setTimeout(() => {
          audioHauntingService.stopHeartbeat()
        }, 12000)
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to trigger jumpscare heartbeat:', error)
      }
    },

    // ============================================
    // Seasonal Events System
    // ============================================
    
    /**
     * Get current seasonal event based on date/time
     * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
     * @returns {Object|null} Current seasonal event or null
     */
    getCurrentSeasonalEvent() {
      const now = new Date()
      const month = now.getMonth() // 0-11
      const date = now.getDate()
      const day = now.getDay() // 0-6 (Sunday-Saturday)
      const hours = now.getHours()
      const minutes = now.getMinutes()
      
      // Check for Halloween (October 31st)
      if (month === 9 && date === 31) {
        return {
          type: 'halloween',
          name: 'Halloween',
          icon: '🎃',
          description: 'The veil between worlds is thinnest',
          possessionMultiplier: 2.0, // 200% increase rate
          active: true
        }
      }
      
      // Check for Friday the 13th
      if (day === 5 && date === 13) {
        return {
          type: 'friday13',
          name: 'Friday the 13th',
          icon: '🔪',
          description: 'Unlucky day brings dark omens',
          jumpscareModifier: true, // Inject number 13
          active: true
        }
      }
      
      // Check for Witching Hour (3:33 AM)
      if (hours === 3 && minutes >= 33 && minutes < 34) {
        return {
          type: 'witchingHour',
          name: 'Witching Hour',
          icon: '🕯️',
          description: 'The hour of dark magic',
          hauntingMultiplier: 1.5, // 50% increase to all effects
          active: true
        }
      }
      
      // Check for Full Moon
      const fullMoonPhase = this.calculateMoonPhase(now)
      if (fullMoonPhase >= 0.95 && fullMoonPhase <= 1.05) {
        return {
          type: 'fullMoon',
          name: 'Full Moon',
          icon: '🌕',
          description: 'Spirits are restless tonight',
          intervalMultiplier: 0.75, // 25% shorter intervals
          active: true
        }
      }
      
      return null
    },
    
    /**
     * Calculate moon phase (0 = new moon, 1 = full moon)
     * Uses simplified lunar cycle calculation
     * @param {Date} date - Date to calculate moon phase for
     * @returns {number} Moon phase (0-2, where 1 is full moon)
     */
    calculateMoonPhase(date) {
      // Known full moon: January 6, 2023
      const knownFullMoon = new Date('2023-01-06').getTime()
      const lunarCycle = 29.53059 * 24 * 60 * 60 * 1000 // ~29.53 days in milliseconds
      
      const timeSinceKnownFullMoon = date.getTime() - knownFullMoon
      const cyclesSince = timeSinceKnownFullMoon / lunarCycle
      const currentPhase = cyclesSince % 1
      
      // Convert to 0-2 scale where 1 is full moon
      // 0 = new moon, 1 = full moon, 2 = new moon again
      return Math.abs(1 - Math.abs(currentPhase * 2 - 1)) * 2
    },
    
    /**
     * Apply seasonal event modifiers to possession increase
     * Requirements: 9.1, 9.4
     * @param {number} baseAmount - Base possession increase amount
     * @returns {number} Modified amount
     */
    applySeasonalModifiers(baseAmount) {
      const event = this.getCurrentSeasonalEvent()
      
      if (!event) return baseAmount
      
      let modifiedAmount = baseAmount
      
      // Apply possession multiplier (Halloween)
      if (event.possessionMultiplier) {
        modifiedAmount *= event.possessionMultiplier
        console.log(`[AdvancedHaunting] ${event.name} active: possession increase ${baseAmount} -> ${modifiedAmount}`)
      }
      
      // Apply haunting multiplier (Witching Hour)
      if (event.hauntingMultiplier) {
        modifiedAmount *= event.hauntingMultiplier
        console.log(`[AdvancedHaunting] ${event.name} active: haunting effects increased by ${(event.hauntingMultiplier - 1) * 100}%`)
      }
      
      return modifiedAmount
    },
    
    /**
     * Get interval multiplier for seasonal events
     * Requirements: 9.4
     * @returns {number} Interval multiplier (1.0 = normal, 0.75 = 25% shorter)
     */
    getSeasonalIntervalMultiplier() {
      const event = this.getCurrentSeasonalEvent()
      
      if (event && event.intervalMultiplier) {
        return event.intervalMultiplier
      }
      
      return 1.0
    },
    
    /**
     * Check if Friday the 13th jumpscare modifier is active
     * Requirements: 9.2
     * @returns {boolean} True if Friday the 13th is active
     */
    isFriday13Active() {
      const event = this.getCurrentSeasonalEvent()
      return event && event.type === 'friday13'
    },

    // ============================================
    // Easter Eggs System
    // ============================================
    
    /**
     * Discover an easter egg
     * Requirements: 8.5, 8.6
     * @param {string} eggId - Easter egg identifier
     */
    discoverEasterEgg(eggId) {
      if (this.discoveredEasterEggs.has(eggId)) {
        console.log(`[AdvancedHaunting] Easter egg ${eggId} already discovered`)
        return false
      }
      
      this.discoveredEasterEggs.add(eggId)
      this.statistics.easterEggsFound++
      
      console.log(`[AdvancedHaunting] Easter egg discovered: ${eggId}`)
      
      // Record event
      this.recordEvent('easter_egg_discovered', { eggId })
      
      // Check if all easter eggs are discovered
      this.checkParanormalInvestigatorAchievement()
      
      this.debouncedSave()
      
      return true
    },
    
    /**
     * Check if all easter eggs are discovered for achievement
     * Requirements: 8.6
     */
    checkParanormalInvestigatorAchievement() {
      const allEasterEggs = [
        'konami_code',
        'secret_phrase',
        'secret_coordinate',
        'secret_wallpaper'
      ]
      
      const allDiscovered = allEasterEggs.every(egg => this.discoveredEasterEggs.has(egg))
      
      if (allDiscovered && !this.achievements.has('paranormal_investigator')) {
        this.unlockAchievement('paranormal_investigator', 'Paranormal Investigator', 'Discovered all easter eggs')
      }
    },
    
    /**
     * Unlock an achievement
     * @param {string} achievementId - Achievement identifier
     * @param {string} name - Achievement name
     * @param {string} description - Achievement description
     */
    unlockAchievement(achievementId, name, description) {
      if (this.achievements.has(achievementId)) {
        console.log(`[AdvancedHaunting] Achievement ${achievementId} already unlocked`)
        return false
      }
      
      this.achievements.add(achievementId)
      this.statistics.achievementsUnlocked++
      
      console.log(`[AdvancedHaunting] Achievement unlocked: ${achievementId}`)
      
      // Record event
      this.recordEvent('achievement_unlocked', { 
        achievementId,
        name,
        description
      })
      
      // Emit event for UI notification
      window.dispatchEvent(new CustomEvent('necro-achievement-unlocked', {
        detail: { 
          id: achievementId,
          name,
          description
        }
      }))
      
      this.debouncedSave()
      
      return true
    },
    
    /**
     * Setup easter egg detection listeners
     */
    setupEasterEggDetection() {
      // Konami code detection
      const keySequence = []
      
      const handleKeyDown = async (event) => {
        keySequence.push(event.key)
        
        // Keep only the last 10 keys
        if (keySequence.length > 10) {
          keySequence.shift()
        }
        
        // Check if sequence matches Konami code
        if (keySequence.length === 10) {
          try {
            const { metaHorrorService } = await import('../utils/metaHorrorService.js')
            
            if (metaHorrorService.checkKonamiCode(keySequence)) {
              console.log('[AdvancedHaunting] KONAMI CODE ACTIVATED!')
              
              // Discover easter egg
              this.discoverEasterEgg('konami_code')
              
              // Activate Ghost Mode
              metaHorrorService.activateGhostMode()
              
              // Reset sequence
              keySequence.length = 0
            }
          } catch (error) {
            console.error('[AdvancedHaunting] Failed to check Konami code:', error)
          }
        }
      }
      
      window.addEventListener('keydown', handleKeyDown)
      
      // Secret coordinate detection
      let clickHistory = []
      
      const handleClick = async (event) => {
        const x = event.clientX
        const y = event.clientY
        
        // Add to click history
        clickHistory.push({ x, y, timestamp: Date.now() })
        
        // Keep only clicks from last 5 seconds
        const fiveSecondsAgo = Date.now() - 5000
        clickHistory = clickHistory.filter(click => click.timestamp > fiveSecondsAgo)
        
        // Check if we have 3 clicks near (666, 666)
        const nearTargetClicks = clickHistory.filter(click => {
          return Math.abs(click.x - 666) <= 10 && Math.abs(click.y - 666) <= 10
        })
        
        if (nearTargetClicks.length >= 3) {
          try {
            const { metaHorrorService } = await import('../utils/metaHorrorService.js')
            
            if (metaHorrorService.checkSecretCoordinate(x, y, nearTargetClicks.length)) {
              console.log('[AdvancedHaunting] SECRET COORDINATE ACTIVATED!')
              
              // Discover easter egg
              this.discoverEasterEgg('secret_coordinate')
              
              // Trigger special jumpscare
              await metaHorrorService.triggerSecretJumpscare()
              
              // Clear click history
              clickHistory = []
            }
          } catch (error) {
            console.error('[AdvancedHaunting] Failed to check secret coordinate:', error)
          }
        }
      }
      
      window.addEventListener('click', handleClick)
      
      // Secret wallpaper unlock at possession level 66
      let wallpaperUnlocked = false
      
      watch(
        () => this.possessionLevel,
        async (level) => {
          if (level === 66 && !wallpaperUnlocked) {
            try {
              const { metaHorrorService } = await import('../utils/metaHorrorService.js')
              
              if (metaHorrorService.unlockSecretWallpaper(level)) {
                console.log('[AdvancedHaunting] SECRET WALLPAPER UNLOCKED!')
                
                // Discover easter egg
                this.discoverEasterEgg('secret_wallpaper')
                
                wallpaperUnlocked = true
              }
            } catch (error) {
              console.error('[AdvancedHaunting] Failed to unlock secret wallpaper:', error)
            }
          }
        }
      )
      
      console.log('[AdvancedHaunting] Easter egg detection initialized')
    },

    // ============================================
    // Ending System
    // ============================================
    
    checkEndingConditions() {
      // Don't check if an ending has already been reached
      if (this.endingReached) {
        return this.endingReached
      }
      
      // Check for "Possessed" ending: possession reaches 100
      if (this.possessionLevel >= 100) {
        this.triggerEnding('possessed')
        return 'possessed'
      }
      
      // Check for "Purified" ending: possession reduced to 0
      if (this.possessionLevel === 0 && this.sessionStartTime) {
        const sessionDuration = Date.now() - this.sessionStartTime
        // Only trigger if session has been running for at least 5 minutes
        if (sessionDuration >= 300000) {
          this.triggerEnding('purified')
          return 'purified'
        }
      }
      
      // Check for "Survivor" ending: 1800 seconds (30 min) with possession < 50
      if (this.sessionStartTime) {
        const sessionDuration = Date.now() - this.sessionStartTime
        if (sessionDuration >= 1800000 && this.possessionLevel < 50) {
          this.triggerEnding('survivor')
          return 'survivor'
        }
      }
      
      return null
    },
    
    triggerEnding(endingType) {
      console.log(`[AdvancedHaunting] Triggering ${endingType} ending`)
      
      this.endingReached = endingType
      
      // Update statistics
      this.statistics.endingsReached.add(endingType)
      
      // Record ending event
      this.recordEvent('ending_reached', {
        ending: endingType,
        possessionLevel: this.possessionLevel,
        sessionDuration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0
      })
      
      this.endSession()
      this.saveToLocalStorage()
      
      // Emit custom event for UI to display ending screen
      window.dispatchEvent(new CustomEvent('necro-ending-reached', {
        detail: { ending: endingType }
      }))
    },
    
    setupBeforeUnloadHandler() {
      // Check for "Consumed" ending: browser close with possession > 60
      window.addEventListener('beforeunload', (event) => {
        if (this.possessionLevel > 60 && !this.endingReached) {
          // Store consumed flag for next session warning
          try {
            localStorage.setItem('necro-os-consumed-warning', JSON.stringify({
              timestamp: Date.now(),
              possessionLevel: this.possessionLevel
            }))
            console.log('[AdvancedHaunting] Consumed ending triggered on browser close')
          } catch (error) {
            console.error('[AdvancedHaunting] Failed to save consumed warning:', error)
          }
        }
      })
      
      console.log('[AdvancedHaunting] Before unload handler setup complete')
    },
    
    checkConsumedWarning() {
      try {
        const warning = localStorage.getItem('necro-os-consumed-warning')
        if (warning) {
          const data = JSON.parse(warning)
          
          // Show warning if it was set within the last 24 hours
          const hoursSinceConsumed = (Date.now() - data.timestamp) / (1000 * 60 * 60)
          if (hoursSinceConsumed < 24) {
            console.log('[AdvancedHaunting] Consumed warning detected from previous session')
            
            // Emit event for UI to show warning
            window.dispatchEvent(new CustomEvent('necro-consumed-warning', {
              detail: { 
                timestamp: data.timestamp,
                possessionLevel: data.possessionLevel
              }
            }))
          } else {
            // Clear old warning
            localStorage.removeItem('necro-os-consumed-warning')
          }
        }
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to check consumed warning:', error)
      }
    },

    // ============================================
    // Integration with Ghost Behavior Store
    // ============================================
    
    initializeHauntingIntegration() {
      try {
        const ghostBehavior = useGhostBehaviorStore()
        
        // Watch for haunting level changes (1-10) and map to possession contribution
        watch(
          () => ghostBehavior.hauntingLevel,
          (newLevel) => {
            // Map haunting level 1-10 to possession contribution (0-50)
            const contribution = newLevel * 5
            
            console.log(`[AdvancedHaunting] Ghost haunting level changed to ${newLevel}, contributing ${contribution} to possession`)
            
            // This is a contribution, not a direct set
            // The actual possession level is managed by the escalation timer
            // But we can use this to trigger effects at certain thresholds
          },
          { immediate: true }
        )
        
        console.log('[AdvancedHaunting] Initialized integration with ghost behavior store')
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to initialize haunting integration:', error)
      }
    },
    
    // ============================================
    // Integration with Visual Corruption Store
    // ============================================
    
    initializeVisualCorruptionIntegration() {
      try {
        const visualCorruption = useVisualCorruptionStore()
        
        // Watch possession level and trigger visual corruption at thresholds
        watch(
          () => this.possessionLevel,
          (level, oldLevel) => {
            // Check if feature is enabled
            if (!this.isFeatureEnabled('visualCorruption')) {
              console.log('[AdvancedHaunting] Visual corruption disabled, skipping effects')
              return
            }
            
            // Trigger glitch corruption at possession level 60
            if (level >= 60 && oldLevel < 60) {
              console.log('[AdvancedHaunting] Possession reached 60, triggering glitch corruption')
              visualCorruption.triggerWallpaperFlicker()
              
              // Trigger additional glitch effects
              if (typeof visualCorruption.replaceWallpaper === 'function') {
                visualCorruption.replaceWallpaper()
              }
            }
            
            // Trigger invert corruption at possession level 80
            if (level >= 80 && oldLevel < 80) {
              console.log('[AdvancedHaunting] Possession reached 80, triggering invert corruption')
              
              // Apply maximum visual corruption effects
              visualCorruption.darkenBackground()
              visualCorruption.darkenBackground() // Double darken for dramatic effect
              
              // Increase wallpaper flicker frequency
              if (visualCorruption.desktopCorruption.flickerInterval > 5000) {
                visualCorruption.desktopCorruption.flickerInterval = 5000 // 5 seconds
                console.log('[AdvancedHaunting] Increased wallpaper flicker frequency to maximum')
              }
            }
            
            // Continuous effects based on possession level ranges
            if (level >= 70 && level < 80) {
              // High possession: occasional flickers
              if (Math.random() < 0.1) { // 10% chance on each possession change
                visualCorruption.triggerWallpaperFlicker()
              }
            } else if (level >= 80) {
              // Very high possession: frequent flickers
              if (Math.random() < 0.3) { // 30% chance on each possession change
                visualCorruption.triggerWallpaperFlicker()
              }
            }
          },
          { immediate: true }
        )
        
        console.log('[AdvancedHaunting] Initialized integration with visual corruption store')
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to initialize visual corruption integration:', error)
      }
    },

    // ============================================
    // Performance Monitoring
    // ============================================
    
    /**
     * Start FPS monitoring to reduce effects if performance drops
     */
    startPerformanceMonitoring() {
      let frameCount = 0
      let lastTime = performance.now()
      
      // Check FPS every 2 seconds
      this._performanceMonitor.fpsCheckInterval = setInterval(() => {
        const currentTime = performance.now()
        const deltaTime = currentTime - lastTime
        const fps = (frameCount / deltaTime) * 1000
        
        this._performanceMonitor.fps = Math.round(fps)
        this._performanceMonitor.frameCount = frameCount
        
        // Check if FPS is below 30
        if (fps < 30 && !this._performanceMonitor.effectsReduced) {
          console.warn(`[AdvancedHaunting] Low FPS detected (${fps.toFixed(1)}), reducing effects`)
          this.reduceEffectsForPerformance()
          this._performanceMonitor.effectsReduced = true
        } else if (fps >= 45 && this._performanceMonitor.effectsReduced) {
          console.log(`[AdvancedHaunting] FPS recovered (${fps.toFixed(1)}), restoring effects`)
          this.restoreEffects()
          this._performanceMonitor.effectsReduced = false
        }
        
        // Reset counters
        frameCount = 0
        lastTime = currentTime
      }, 2000)
      
      // Count frames using requestAnimationFrame
      const countFrame = () => {
        frameCount++
        this._performanceMonitor.animationFrameId = requestAnimationFrame(countFrame)
      }
      
      countFrame()
      
      console.log('[AdvancedHaunting] Performance monitoring started')
    },
    
    /**
     * Stop FPS monitoring
     */
    stopPerformanceMonitoring() {
      if (this._performanceMonitor.fpsCheckInterval) {
        clearInterval(this._performanceMonitor.fpsCheckInterval)
        this._performanceMonitor.fpsCheckInterval = null
      }
      
      if (this._performanceMonitor.animationFrameId) {
        cancelAnimationFrame(this._performanceMonitor.animationFrameId)
        this._performanceMonitor.animationFrameId = null
      }
      
      console.log('[AdvancedHaunting] Performance monitoring stopped')
    },
    
    /**
     * Reduce effects when FPS drops below 30
     */
    async reduceEffectsForPerformance() {
      try {
        // Reduce audio layer volumes
        const { audioHauntingService } = await import('../utils/audioHauntingService.js')
        
        Object.keys(audioHauntingService.layers).forEach(layerName => {
          const currentVolume = audioHauntingService.layers[layerName].volume
          audioHauntingService.setLayerVolume(layerName, currentVolume * 0.5)
        })
        
        console.log('[AdvancedHaunting] Reduced audio volumes for performance')
        
        // Reduce visual corruption frequency
        const visualCorruption = useVisualCorruptionStore()
        if (visualCorruption.desktopCorruption.flickerInterval < 20000) {
          visualCorruption.desktopCorruption.flickerInterval = 20000 // Increase to 20 seconds
          console.log('[AdvancedHaunting] Reduced visual corruption frequency for performance')
        }
        
        // Stop continuous heartbeat if active
        if (this._heartbeatActive) {
          audioHauntingService.stopHeartbeat()
          this._heartbeatActive = false
          console.log('[AdvancedHaunting] Stopped continuous heartbeat for performance')
        }
        
        // Record performance reduction event
        this.recordEvent('performance_reduction', {
          fps: this._performanceMonitor.fps,
          reason: 'low_fps'
        })
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to reduce effects for performance:', error)
      }
    },
    
    /**
     * Restore effects when FPS recovers
     */
    async restoreEffects() {
      try {
        // Restore audio layer volumes based on possession level
        const { audioHauntingService } = await import('../utils/audioHauntingService.js')
        audioHauntingService.updateAudioForPossessionLevel(this.possessionLevel)
        
        console.log('[AdvancedHaunting] Restored audio volumes')
        
        // Restore visual corruption frequency
        const visualCorruption = useVisualCorruptionStore()
        if (this.possessionLevel >= 80) {
          visualCorruption.desktopCorruption.flickerInterval = 5000
        } else if (this.possessionLevel >= 60) {
          visualCorruption.desktopCorruption.flickerInterval = 10000
        }
        
        console.log('[AdvancedHaunting] Restored visual corruption frequency')
        
        // Restart continuous heartbeat if possession > 80
        if (this.possessionLevel > 80 && !this._heartbeatActive) {
          await audioHauntingService.startContinuousHeartbeat(100)
          this._heartbeatActive = true
          console.log('[AdvancedHaunting] Restarted continuous heartbeat')
        }
        
        // Record performance restoration event
        this.recordEvent('performance_restoration', {
          fps: this._performanceMonitor.fps
        })
      } catch (error) {
        console.error('[AdvancedHaunting] Failed to restore effects:', error)
      }
    },
    
    /**
     * Get current performance metrics
     */
    getPerformanceMetrics() {
      return {
        fps: this._performanceMonitor.fps,
        effectsReduced: this._performanceMonitor.effectsReduced,
        frameCount: this._performanceMonitor.frameCount
      }
    },

    // ============================================
    // Initialization and Cleanup
    // ============================================
    
    initialize() {
      console.log('[AdvancedHaunting] Initializing advanced haunting system')
      
      // Load saved progress
      this.loadFromLocalStorage()
      
      // Apply saved theme
      this.applyTheme(this.customization.theme)
      
      // Check for consumed warning from previous session
      this.checkConsumedWarning()
      
      // Setup before unload handler for consumed ending
      this.setupBeforeUnloadHandler()
      
      // Initialize haunting integration with ghost behavior store
      this.initializeHauntingIntegration()
      
      // Initialize visual corruption integration
      this.initializeVisualCorruptionIntegration()
      
      // Initialize audio haunting
      this.initializeAudioHaunting()
      
      // Initialize meta horror effects
      this.initializeMetaHorrorEffects()
      
      // Setup user name detection
      this.setupUserNameDetection()
      
      // Setup easter egg detection
      this.setupEasterEggDetection()
      
      // Start session if not already started
      if (!this.sessionStartTime) {
        this.startSession()
      } else {
        // Resume session - restart escalation timer
        this.startPossessionEscalation()
      }
      
      // Start checking for ending conditions periodically
      this.startEndingConditionChecker()
      
      // Start performance monitoring
      this.startPerformanceMonitoring()
      
      console.log('[AdvancedHaunting] Advanced haunting system initialized')
    },
    
    startEndingConditionChecker() {
      // Check ending conditions every 10 seconds
      setInterval(() => {
        this.checkEndingConditions()
      }, 10000)
      
      console.log('[AdvancedHaunting] Ending condition checker started')
    },
    
    cleanup() {
      console.log('[AdvancedHaunting] Cleaning up advanced haunting system')
      
      // Stop timers
      this.stopPossessionEscalation()
      this.stopWhisperLoop()
      this.stopPerformanceMonitoring()
      
      if (this._saveDebounceTimer) {
        clearTimeout(this._saveDebounceTimer)
        this._saveDebounceTimer = null
      }
      
      // Stop audio
      this._heartbeatActive = false
      
      // Save final state
      this.endSession()
      
      console.log('[AdvancedHaunting] Advanced haunting system cleaned up')
    }
  }
})
