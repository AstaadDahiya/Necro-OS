import { defineStore } from 'pinia'
import { playModemHandshake, startBrownNoise, stopBrownNoise, startWhisperScheduler, playPhantomTyping, playHDDGrinding, startHeartbeat, stopHeartbeat, playWhisperSound } from '../utils/audioHaunting'
import { useVisualCorruptionStore } from './visualCorruption'

export const useGhostBehaviorStore = defineStore('ghostBehavior', {
  state: () => ({
    hauntingLevel: 5,
    idleTimer: null,
    lastActionTime: Date.now(),
    isHaunting: false,
    escalationTimer: null,
    idleTimeout: 5000, // 5 seconds initial timeout (reduced from 10)
    actionFrequency: 3000, // 3 seconds between actions (reduced from 5)
    brownNoiseData: null, // Store brown noise context for cleanup
    whisperCleanup: null, // Store whisper scheduler cleanup function
    audioHauntingActive: {
      brownNoise: false,
      modem: false,
      whispers: false
    }
  }),

  getters: {
    currentIdleTimeout: (state) => {
      // Decrease idle timeout by 2 seconds per level, minimum 2 seconds
      return Math.max(2000, state.idleTimeout - (state.hauntingLevel - 1) * 2000)
    },

    currentActionFrequency: (state) => {
      // Increase frequency by 20% per level (decrease time between actions)
      return Math.max(1000, state.actionFrequency / Math.pow(1.2, state.hauntingLevel - 1))
    },

    canSpamWindows: (state) => {
      return state.hauntingLevel >= 5
    }
  },

  actions: {
    startIdleDetection() {
      // Clear any existing timer
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
      }

      // Set up idle detection timer
      this.idleTimer = setTimeout(() => {
        this.isHaunting = true
        this.lastActionTime = Date.now()
      }, this.currentIdleTimeout)
    },

    resetIdleTimer() {
      this.isHaunting = false
      this.startIdleDetection()
    },

    incrementHauntingLevel() {
      if (this.hauntingLevel < 10) {
        this.hauntingLevel++
        console.log(`Haunting level increased to ${this.hauntingLevel}`)
        
        // Trigger audio haunting based on level
        this.checkAudioHaunting()
        
        // Update visual corruption - will be handled by watcher
      }
    },

    checkAudioHaunting() {
      // Start ambient audio at level 2
      if (this.hauntingLevel >= 2 && !this.audioHauntingActive.brownNoise) {
        console.log('[GhostBehavior] Starting ambient audio...')
        this.brownNoiseData = startBrownNoise()
        this.audioHauntingActive.brownNoise = true
      }

      // Play modem sound at level 3
      if (this.hauntingLevel >= 3 && !this.audioHauntingActive.modem) {
        console.log('[GhostBehavior] Playing modem handshake...')
        playModemHandshake()
        this.audioHauntingActive.modem = true
      }

      // Start whispers at level 4
      if (this.hauntingLevel >= 4 && !this.audioHauntingActive.whispers) {
        console.log('[GhostBehavior] Starting whisper effects...')
        this.whisperCleanup = startWhisperScheduler()
        this.audioHauntingActive.whispers = true
        
        // Play whisper sound immediately
        playWhisperSound()
        
        // Schedule periodic whispers
        setInterval(() => {
          if (this.hauntingLevel >= 4) {
            playWhisperSound()
          }
        }, 45000) // Every 45 seconds
      }
      
      // Play phantom typing at level 5
      if (this.hauntingLevel >= 5) {
        console.log('[GhostBehavior] Adding phantom typing effects...')
        // Play immediately
        playPhantomTyping()
        
        // Schedule periodic typing sounds
        setInterval(() => {
          if (this.hauntingLevel >= 5 && Math.random() < 0.3) {
            playPhantomTyping()
          }
        }, 30000) // Every 30 seconds, 30% chance
      }
      
      // Start heartbeat at level 6+
      if (this.hauntingLevel >= 6) {
        console.log('[GhostBehavior] Starting heartbeat tension...')
        startHeartbeat()
        
        // Occasional HDD grinding
        setInterval(() => {
          if (this.hauntingLevel >= 6 && Math.random() < 0.2) {
            playHDDGrinding()
          }
        }, 60000) // Every 60 seconds, 20% chance
      }
      
      // Trigger screen glitch at level 3+
      if (this.hauntingLevel >= 3) {
        console.log('[GhostBehavior] Triggering screen glitch...')
        // Import and call glitch function
        import('../utils/ghost.js').then(module => {
          module.screenGlitch(this.hauntingLevel)
        })
      }
    },

    setHauntingLevel(level) {
      this.hauntingLevel = Math.max(1, Math.min(10, level))
      
      // Update visual corruption when level is manually set - will be handled by watcher
    },

    startEscalation() {
      // Clear any existing escalation timer
      if (this.escalationTimer) {
        clearInterval(this.escalationTimer)
      }

      // Check audio haunting for initial level
      this.checkAudioHaunting()

      // Increment haunting level every 30 seconds (reduced from 60)
      this.escalationTimer = setInterval(() => {
        this.incrementHauntingLevel()
      }, 30000)
    },

    stopEscalation() {
      if (this.escalationTimer) {
        clearInterval(this.escalationTimer)
        this.escalationTimer = null
      }
    },

    stopIdleDetection() {
      if (this.idleTimer) {
        clearTimeout(this.idleTimer)
        this.idleTimer = null
      }
    },

    cleanup() {
      this.stopIdleDetection()
      this.stopEscalation()
      this.cleanupAudioHaunting()
      
      // Cleanup visual corruption
      try {
        const visualCorruption = useVisualCorruptionStore()
        visualCorruption.cleanup()
      } catch (error) {
        console.error('Failed to cleanup visual corruption:', error)
      }
    },

    cleanupAudioHaunting() {
      // Stop ambient audio
      if (this.brownNoiseData) {
        stopBrownNoise(this.brownNoiseData)
        this.brownNoiseData = null
        this.audioHauntingActive.brownNoise = false
      }

      // Stop whisper scheduler
      if (this.whisperCleanup) {
        this.whisperCleanup()
        this.whisperCleanup = null
        this.audioHauntingActive.whispers = false
      }
    }
  }
})
