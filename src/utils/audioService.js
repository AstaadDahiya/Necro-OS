// Audio service for Windows 95 sounds using Web Audio API

class AudioService {
  constructor() {
    this.context = null
    this.sounds = {}
    this.volume = 0.15 // Reduced from 0.5 to be less irritating
    this.initialized = false
  }

  // Initialize Web Audio API context
  async init() {
    if (this.initialized) return

    try {
      // Create audio context
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      
      // Load sound files
      await this.loadSounds()
      
      this.initialized = true
      console.log('Audio service initialized')
    } catch (error) {
      console.error('Failed to initialize audio service:', error)
    }
  }

  // Load all sound files
  async loadSounds() {
    const soundFiles = {
      windowOpen: '/sounds/window-open.mp3',
      windowClose: '/sounds/window-close.mp3',
      error: '/sounds/error.mp3',
      menu: '/sounds/menu.mp3',
      startup: '/sounds/startup.mp3'
    }

    const loadPromises = Object.entries(soundFiles).map(async ([name, path]) => {
      try {
        // For now, create simple beep sounds using oscillators
        // In production, these would load actual audio files
        this.sounds[name] = { type: 'oscillator', frequency: this.getFrequency(name) }
      } catch (error) {
        console.error(`Failed to load sound ${name}:`, error)
      }
    })

    await Promise.all(loadPromises)
  }

  // Get frequency for different sound types (fallback for missing audio files)
  getFrequency(soundName) {
    const frequencies = {
      windowOpen: 800,
      windowClose: 600,
      error: 400,
      menu: 1000,
      startup: 523.25 // C5 note
    }
    return frequencies[soundName] || 440
  }

  // Resume audio context on user interaction (required by browsers)
  async resume() {
    if (!this.initialized) {
      await this.init()
    }
    
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  // Play a sound by name
  async play(soundName) {
    try {
      // Initialize if not already done
      if (!this.initialized) {
        await this.init()
      }

      // Resume context if suspended
      await this.resume()

      const sound = this.sounds[soundName]
      if (!sound) {
        console.warn(`Sound not found: ${soundName}`)
        return
      }

      // Create oscillator for beep sound (fallback)
      if (sound.type === 'oscillator') {
        this.playBeep(sound.frequency, 0.1)
      }
    } catch (error) {
      console.error(`Failed to play sound ${soundName}:`, error)
    }
  }

  // Play a simple beep sound using oscillator
  playBeep(frequency, duration) {
    if (!this.context) return

    const oscillator = this.context.createOscillator()
    const gainNode = this.context.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(this.context.destination)

    oscillator.frequency.value = frequency
    oscillator.type = 'sine'

    // Apply volume
    gainNode.gain.value = this.volume

    // Fade out to avoid clicks
    gainNode.gain.setValueAtTime(this.volume, this.context.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + duration)

    oscillator.start(this.context.currentTime)
    oscillator.stop(this.context.currentTime + duration)
  }

  // Set volume (0.0 to 1.0)
  setVolume(value) {
    this.volume = Math.max(0, Math.min(1, value))
  }

  // Get current volume
  getVolume() {
    return this.volume
  }
}

// Export singleton instance
export const audioService = new AudioService()
