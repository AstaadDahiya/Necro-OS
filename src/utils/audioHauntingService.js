// Audio Haunting Service - Four-layer audio system for advanced haunting
// Manages ambient, effects, whispers, and tension audio layers

class AudioHauntingService {
  constructor() {
    this.context = null
    this.initialized = false
    this.advancedHauntingStore = null
    
    // Four audio layers with independent state
    this.layers = {
      ambient: {
        volume: 0,
        currentSound: null,
        active: false,
        gainNode: null,
        sourceNode: null
      },
      effects: {
        volume: 0,
        currentSound: null,
        active: false,
        gainNode: null,
        sourceNode: null
      },
      whispers: {
        volume: 0,
        currentSound: null,
        active: false,
        gainNode: null,
        sourceNode: null
      },
      tension: {
        volume: 0,
        currentSound: null,
        active: false,
        gainNode: null,
        sourceNode: null
      }
    }
    
    // Audio buffers cache for lazy loading
    this.audioBuffers = {}
    
    // Audio buffer pool for reusing audio nodes
    this.audioPool = {
      ambient: [],
      effects: [],
      whispers: [],
      tension: []
    }
    
    // Maximum pool size per layer
    this.maxPoolSize = 3
    
    // Loading state tracking
    this.loadingBuffers = new Map() // Track in-progress loads
    
    // Base volume for calculations (in linear scale, not dB)
    this.baseVolume = 0.3
    
    // Performance monitoring
    this.performanceMetrics = {
      activeAudioNodes: 0,
      bufferMemoryUsage: 0,
      lastCleanup: Date.now()
    }
    
    // Cleanup interval (5 minutes)
    this.cleanupInterval = null
  }

  // Set the advanced haunting store for feature checks
  setStore(store) {
    this.advancedHauntingStore = store
  }

  // Check if audio haunting feature is enabled
  isFeatureEnabled() {
    if (!this.advancedHauntingStore) {
      return true // Default to enabled if store not initialized
    }
    return this.advancedHauntingStore.isFeatureEnabled('audioHaunting')
  }

  // Emit visual cue event for accessibility
  emitVisualCue(audioType, detail = null) {
    if (!this.advancedHauntingStore || !this.advancedHauntingStore.customization.visualCuesForAudio) {
      return
    }
    
    window.dispatchEvent(new CustomEvent('necro-audio-event', {
      detail: { audioType, detail }
    }))
  }

  // Initialize Web Audio API context and audio layers
  async initializeAudioLayers() {
    if (this.initialized) return

    try {
      // Create audio context
      this.context = new (window.AudioContext || window.webkitAudioContext)()
      
      // Create gain nodes for each layer
      Object.keys(this.layers).forEach(layerName => {
        const gainNode = this.context.createGain()
        gainNode.connect(this.context.destination)
        gainNode.gain.value = 0 // Start silent
        this.layers[layerName].gainNode = gainNode
      })
      
      // Start automatic memory cleanup
      this.startMemoryCleanup()
      
      this.initialized = true
      console.log('[AudioHaunting] Audio haunting service initialized with 4 layers and memory management')
    } catch (error) {
      console.error('[AudioHaunting] Failed to initialize audio haunting service:', error)
      throw error
    }
  }

  // Resume audio context on user interaction (required by browsers)
  async resume() {
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }
    
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume()
    }
  }

  // Set volume for a specific layer (0.0 to 1.0)
  setLayerVolume(layerName, volume) {
    if (!this.layers[layerName]) {
      console.warn(`Invalid layer name: ${layerName}`)
      return
    }

    // Clamp volume between 0 and 1
    const clampedVolume = Math.max(0, Math.min(1, volume))
    
    // Update layer state
    this.layers[layerName].volume = clampedVolume
    
    // Update gain node if it exists
    if (this.layers[layerName].gainNode) {
      this.layers[layerName].gainNode.gain.value = clampedVolume
    }
  }

  // Play audio on a specific layer (with audio pooling)
  async playOnLayer(layerName, soundPath, options = {}) {
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    if (!this.layers[layerName]) {
      console.warn(`[AudioHaunting] Invalid layer name: ${layerName}`)
      return
    }

    const layer = this.layers[layerName]

    try {
      // Stop current sound on this layer if playing
      if (layer.sourceNode) {
        try {
          layer.sourceNode.stop()
        } catch (e) {
          // Ignore if already stopped
        }
        
        // Return to pool for reuse
        this.returnAudioSourceToPool(layerName, layer.sourceNode)
        layer.sourceNode = null
      }

      // Load audio buffer (lazy loaded and cached)
      const buffer = await this.loadAudioBuffer(soundPath)
      
      // Get source from pool or create new one
      const source = this.getAudioSourceFromPool(layerName, buffer)
      source.connect(layer.gainNode)
      
      // Configure looping if specified
      if (options.loop) {
        source.loop = true
      }
      
      // Store reference
      layer.sourceNode = source
      layer.currentSound = soundPath
      layer.active = true
      
      // Handle sound end
      source.onended = () => {
        if (layer.sourceNode === source) {
          // Return to pool
          this.returnAudioSourceToPool(layerName, source)
          layer.sourceNode = null
          layer.currentSound = null
          layer.active = false
        }
      }
      
      // Start playback
      source.start(0)
      
      console.log(`[AudioHaunting] Playing ${soundPath} on ${layerName} layer`)
    } catch (error) {
      console.error(`[AudioHaunting] Failed to play sound on ${layerName} layer:`, error)
      layer.active = false
    }
  }

  // Load audio buffer from URL (with caching and lazy loading)
  async loadAudioBuffer(url) {
    // Return cached buffer if available
    if (this.audioBuffers[url]) {
      console.log(`[AudioHaunting] Using cached buffer for ${url}`)
      return this.audioBuffers[url]
    }

    // Check if already loading this buffer
    if (this.loadingBuffers.has(url)) {
      console.log(`[AudioHaunting] Waiting for in-progress load of ${url}`)
      return this.loadingBuffers.get(url)
    }

    // Start loading
    const loadPromise = (async () => {
      try {
        console.log(`[AudioHaunting] Lazy loading audio buffer: ${url}`)
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
        
        // Cache the buffer
        this.audioBuffers[url] = audioBuffer
        
        // Update memory usage metrics
        const bufferSize = audioBuffer.length * audioBuffer.numberOfChannels * 4 // 4 bytes per float32
        this.performanceMetrics.bufferMemoryUsage += bufferSize
        
        console.log(`[AudioHaunting] Loaded ${url} (${(bufferSize / 1024 / 1024).toFixed(2)} MB)`)
        console.log(`[AudioHaunting] Total buffer memory: ${(this.performanceMetrics.bufferMemoryUsage / 1024 / 1024).toFixed(2)} MB`)
        
        return audioBuffer
      } catch (error) {
        console.error(`[AudioHaunting] Failed to load audio buffer from ${url}:`, error)
        throw error
      } finally {
        // Remove from loading map
        this.loadingBuffers.delete(url)
      }
    })()

    // Store the promise so concurrent requests can wait
    this.loadingBuffers.set(url, loadPromise)
    
    return loadPromise
  }
  
  // Get audio source from pool or create new one
  getAudioSourceFromPool(layerName, buffer) {
    const pool = this.audioPool[layerName]
    
    // Try to reuse an existing source from pool
    if (pool && pool.length > 0) {
      const source = pool.pop()
      source.buffer = buffer
      console.log(`[AudioHaunting] Reused audio source from ${layerName} pool (${pool.length} remaining)`)
      return source
    }
    
    // Create new source if pool is empty
    const source = this.context.createBufferSource()
    source.buffer = buffer
    this.performanceMetrics.activeAudioNodes++
    console.log(`[AudioHaunting] Created new audio source (total active: ${this.performanceMetrics.activeAudioNodes})`)
    return source
  }
  
  // Return audio source to pool for reuse
  returnAudioSourceToPool(layerName, source) {
    const pool = this.audioPool[layerName]
    
    if (!pool) return
    
    // Only add to pool if under max size
    if (pool.length < this.maxPoolSize) {
      // Disconnect the source
      try {
        source.disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
      
      pool.push(source)
      console.log(`[AudioHaunting] Returned audio source to ${layerName} pool (${pool.length} in pool)`)
    } else {
      // Pool is full, just disconnect and let it be garbage collected
      try {
        source.disconnect()
      } catch (e) {
        // Ignore disconnect errors
      }
      this.performanceMetrics.activeAudioNodes--
      console.log(`[AudioHaunting] Discarded audio source (pool full, active: ${this.performanceMetrics.activeAudioNodes})`)
    }
  }

  // Update audio volumes based on possession level
  // Increases volume by 5dB per 10 possession points
  updateAudioForPossessionLevel(possessionLevel) {
    if (!this.initialized) return

    // Clamp possession level between 0 and 100
    const level = Math.max(0, Math.min(100, possessionLevel))
    
    // Calculate volume multiplier based on possession level
    // 5dB increase per 10 points = 0.5dB per point
    // dB to linear: multiply by 10^(dB/20)
    // For 5dB per 10 points: at level 100, we have 50dB increase
    const dbIncrease = (level / 10) * 5 // 5dB per 10 points
    const volumeMultiplier = Math.pow(10, dbIncrease / 20)
    
    // Calculate final volume (capped at 1.0)
    const targetVolume = Math.min(1.0, this.baseVolume * volumeMultiplier)
    
    // Apply to all layers proportionally
    // Each layer can have different base volumes, but all scale with possession
    Object.keys(this.layers).forEach(layerName => {
      const layer = this.layers[layerName]
      
      // Only update if layer is active
      if (layer.active && layer.gainNode) {
        // Smooth volume transition over 1 second
        const currentTime = this.context.currentTime
        layer.gainNode.gain.cancelScheduledValues(currentTime)
        layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, currentTime)
        layer.gainNode.gain.linearRampToValueAtTime(targetVolume, currentTime + 1.0)
        
        // Update stored volume
        layer.volume = targetVolume
      }
    })
    
    console.log(`Updated audio for possession level ${level}: ${dbIncrease.toFixed(1)}dB increase, volume multiplier: ${volumeMultiplier.toFixed(2)}`)
  }

  // Stop audio on a specific layer
  stopLayer(layerName) {
    if (!this.layers[layerName]) {
      console.warn(`Invalid layer name: ${layerName}`)
      return
    }

    const layer = this.layers[layerName]
    
    if (layer.sourceNode) {
      try {
        layer.sourceNode.stop()
      } catch (e) {
        // Ignore if already stopped
      }
      layer.sourceNode = null
    }
    
    layer.currentSound = null
    layer.active = false
  }

  // Stop all layers
  stopAllLayers() {
    Object.keys(this.layers).forEach(layerName => {
      this.stopLayer(layerName)
    })
  }

  // Get layer state
  getLayerState(layerName) {
    if (!this.layers[layerName]) {
      return null
    }
    
    return {
      volume: this.layers[layerName].volume,
      currentSound: this.layers[layerName].currentSound,
      active: this.layers[layerName].active
    }
  }

  // Get all layers state
  getAllLayersState() {
    const state = {}
    Object.keys(this.layers).forEach(layerName => {
      state[layerName] = this.getLayerState(layerName)
    })
    return state
  }

  // ===== AMBIENT LAYER METHODS =====
  
  // Play distant scream on ambient layer
  // Triggered when possession > 25, at intervals of 45-90 seconds
  // Volume increases by 10dB per 15 possession points (proximity simulation)
  async playDistantScream(possessionLevel) {
    if (!this.isFeatureEnabled()) {
      return
    }
    
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    // Calculate proximity-based volume
    // Base volume + 10dB per 15 possession points above 25
    const possessionAbove25 = Math.max(0, possessionLevel - 25)
    const proximitySteps = Math.floor(possessionAbove25 / 15)
    const dbIncrease = proximitySteps * 10
    
    // Convert dB to linear volume multiplier
    const volumeMultiplier = Math.pow(10, dbIncrease / 20)
    const targetVolume = Math.min(1.0, this.baseVolume * volumeMultiplier)
    
    // Set layer volume for this scream
    this.setLayerVolume('ambient', targetVolume)
    
    // Select random scream sound (we'll use multiple variants if available)
    const screamVariants = [
      '/sounds/haunting/ambient/distant-scream.mp3',
      '/sounds/haunting/ambient/distant-scream-1.mp3',
      '/sounds/haunting/ambient/distant-scream-2.mp3'
    ]
    
    // Try to load a random variant, fallback to first if others don't exist
    let soundPath = screamVariants[Math.floor(Math.random() * screamVariants.length)]
    
    try {
      await this.playOnLayer('ambient', soundPath, { loop: false })
      console.log(`Playing distant scream at possession ${possessionLevel}, proximity steps: ${proximitySteps}, volume: ${targetVolume.toFixed(2)}`)
      
      // Emit visual cue for accessibility
      this.emitVisualCue('distant-scream')
    } catch (error) {
      // Try fallback sound
      console.warn(`Failed to load ${soundPath}, trying fallback`)
      soundPath = screamVariants[0]
      await this.playOnLayer('ambient', soundPath, { loop: false })
      
      // Emit visual cue for accessibility
      this.emitVisualCue('distant-scream')
    }
  }

  // ===== EFFECTS LAYER METHODS =====
  
  // Play phantom typing sound on effects layer
  // Triggered at random 5-20 second intervals
  async playPhantomTyping() {
    if (!this.isFeatureEnabled()) {
      return
    }
    
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    // Set moderate volume for typing effect
    const typingVolume = this.baseVolume * 0.8
    this.setLayerVolume('effects', typingVolume)
    
    // Play phantom typing sound
    const soundPath = '/sounds/haunting/effects/phantom-typing.mp3'
    
    try {
      await this.playOnLayer('effects', soundPath, { loop: false })
      console.log('Playing phantom typing sound')
      
      // Emit visual cue for accessibility
      this.emitVisualCue('phantom-typing')
    } catch (error) {
      console.error('Failed to play phantom typing:', error)
    }
  }

  // Play HDD grinding sound on effects layer
  // Triggered when possession > 50, for durations of 3-8 seconds
  async playHDDGrinding(duration) {
    if (!this.isFeatureEnabled()) {
      return
    }
    
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    // Set volume for HDD grinding (slightly louder to be noticeable)
    const grindingVolume = this.baseVolume * 1.2
    this.setLayerVolume('effects', Math.min(1.0, grindingVolume))
    
    // Play HDD grinding sound
    const soundPath = '/sounds/haunting/effects/hdd-grinding.mp3'
    
    try {
      await this.playOnLayer('effects', soundPath, { loop: false })
      console.log(`Playing HDD grinding sound for ${duration} seconds`)
      
      // Emit visual cue for accessibility
      this.emitVisualCue('hdd-grinding')
      
      // Stop after specified duration
      setTimeout(() => {
        this.stopLayer('effects')
      }, duration * 1000)
    } catch (error) {
      console.error('Failed to play HDD grinding:', error)
    }
  }

  // ===== WHISPERS LAYER METHODS =====
  
  // Play whisper on whispers layer
  // Triggered when possession > 70 and user name is available
  async playWhisper(userName = null) {
    if (!this.isFeatureEnabled()) {
      return
    }
    
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    // Set volume for whispers (quieter, more unsettling)
    const whisperVolume = this.baseVolume * 0.6
    this.setLayerVolume('whispers', whisperVolume)
    
    // If user name is available, try to use personalized whisper
    // For now, we'll use generic whispers (personalized audio would require TTS or pre-recorded names)
    const soundPath = '/sounds/haunting/whispers/generic-1.mp3'
    
    try {
      await this.playOnLayer('whispers', soundPath, { loop: false })
      if (userName) {
        console.log(`Playing whisper with user name: ${userName}`)
        
        // Emit visual cue with user name for accessibility
        this.emitVisualCue('whisper', userName)
      } else {
        console.log('Playing generic whisper')
        
        // Emit visual cue for accessibility
        this.emitVisualCue('whisper')
      }
    } catch (error) {
      console.error('Failed to play whisper:', error)
    }
  }

  // ===== TENSION LAYER METHODS =====
  
  // Start heartbeat on tension layer
  // Used before jumpscares to build tension
  async startHeartbeat(initialBPM = 60) {
    if (!this.isFeatureEnabled()) {
      return
    }
    
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    // Set volume for heartbeat
    const heartbeatVolume = this.baseVolume * 0.7
    this.setLayerVolume('tension', heartbeatVolume)
    
    // Store current BPM for tempo adjustments
    this.currentHeartbeatBPM = initialBPM
    
    // Play heartbeat sound in a loop
    const soundPath = '/sounds/haunting/tension/heartbeat.mp3'
    
    try {
      await this.playOnLayer('tension', soundPath, { loop: true })
      console.log(`Started heartbeat at ${initialBPM} BPM`)
      
      // Emit visual cue for accessibility
      this.emitVisualCue('heartbeat')
    } catch (error) {
      console.error('Failed to start heartbeat:', error)
    }
  }

  // Adjust heartbeat tempo
  // Ramps from current BPM to target BPM over specified duration
  // Used to build tension before jumpscares (60 BPM to 140 BPM over 10 seconds)
  adjustHeartbeatTempo(targetBPM, duration = 10) {
    if (!this.initialized || !this.layers.tension.active) {
      console.warn('Cannot adjust heartbeat tempo: tension layer not active')
      return
    }

    const layer = this.layers.tension
    const startBPM = this.currentHeartbeatBPM || 60
    
    // Calculate playback rate adjustment
    // Playback rate = targetBPM / originalBPM
    // Assuming the heartbeat audio is recorded at 60 BPM
    const originalBPM = 60
    const startRate = startBPM / originalBPM
    const targetRate = targetBPM / originalBPM
    
    // Adjust playback rate of the source node
    if (layer.sourceNode && layer.sourceNode.playbackRate) {
      const currentTime = this.context.currentTime
      
      // Cancel any scheduled changes
      layer.sourceNode.playbackRate.cancelScheduledValues(currentTime)
      
      // Set current rate
      layer.sourceNode.playbackRate.setValueAtTime(startRate, currentTime)
      
      // Ramp to target rate over duration
      layer.sourceNode.playbackRate.linearRampToValueAtTime(targetRate, currentTime + duration)
      
      console.log(`Adjusting heartbeat tempo from ${startBPM} BPM to ${targetBPM} BPM over ${duration} seconds`)
    }
    
    // Update stored BPM
    this.currentHeartbeatBPM = targetBPM
  }

  // Start continuous heartbeat at specified BPM
  // Used when possession > 80 to maintain tension
  async startContinuousHeartbeat(bpm = 100) {
    if (!this.isFeatureEnabled()) {
      return
    }
    
    if (!this.initialized) {
      await this.initializeAudioLayers()
    }

    await this.resume()

    // If heartbeat is already playing, just adjust the tempo
    if (this.layers.tension.active && this.layers.tension.currentSound?.includes('heartbeat')) {
      this.adjustHeartbeatTempo(bpm, 2) // Quick transition to continuous rate
      return
    }

    // Otherwise, start new heartbeat
    await this.startHeartbeat(bpm)
    console.log(`Started continuous heartbeat at ${bpm} BPM`)
  }

  // Stop heartbeat
  stopHeartbeat() {
    this.stopLayer('tension')
    this.currentHeartbeatBPM = null
    console.log('Stopped heartbeat')
  }

  // Start automatic memory cleanup
  startMemoryCleanup() {
    // Clean up unused audio buffers every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.performMemoryCleanup()
    }, 300000) // 5 minutes
    
    console.log('[AudioHaunting] Started automatic memory cleanup (5 min interval)')
  }
  
  // Stop automatic memory cleanup
  stopMemoryCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
      console.log('[AudioHaunting] Stopped automatic memory cleanup')
    }
  }
  
  // Perform memory cleanup
  performMemoryCleanup() {
    const now = Date.now()
    const timeSinceLastCleanup = now - this.performanceMetrics.lastCleanup
    
    console.log(`[AudioHaunting] Performing memory cleanup (${(timeSinceLastCleanup / 1000 / 60).toFixed(1)} min since last cleanup)`)
    
    // Clear audio pools
    let pooledNodes = 0
    Object.keys(this.audioPool).forEach(layerName => {
      pooledNodes += this.audioPool[layerName].length
      this.audioPool[layerName] = []
    })
    
    if (pooledNodes > 0) {
      this.performanceMetrics.activeAudioNodes -= pooledNodes
      console.log(`[AudioHaunting] Cleared ${pooledNodes} pooled audio nodes`)
    }
    
    // Optionally clear unused buffers (buffers not currently playing)
    const activeBuffers = new Set()
    Object.values(this.layers).forEach(layer => {
      if (layer.currentSound) {
        activeBuffers.add(layer.currentSound)
      }
    })
    
    let clearedBuffers = 0
    let freedMemory = 0
    Object.keys(this.audioBuffers).forEach(url => {
      if (!activeBuffers.has(url)) {
        const buffer = this.audioBuffers[url]
        const bufferSize = buffer.length * buffer.numberOfChannels * 4
        freedMemory += bufferSize
        delete this.audioBuffers[url]
        clearedBuffers++
      }
    })
    
    if (clearedBuffers > 0) {
      this.performanceMetrics.bufferMemoryUsage -= freedMemory
      console.log(`[AudioHaunting] Cleared ${clearedBuffers} unused buffers, freed ${(freedMemory / 1024 / 1024).toFixed(2)} MB`)
    }
    
    this.performanceMetrics.lastCleanup = now
    
    console.log(`[AudioHaunting] Memory cleanup complete. Active nodes: ${this.performanceMetrics.activeAudioNodes}, Buffer memory: ${(this.performanceMetrics.bufferMemoryUsage / 1024 / 1024).toFixed(2)} MB`)
  }
  
  // Get performance metrics
  getPerformanceMetrics() {
    return {
      activeAudioNodes: this.performanceMetrics.activeAudioNodes,
      bufferMemoryUsage: this.performanceMetrics.bufferMemoryUsage,
      bufferMemoryUsageMB: (this.performanceMetrics.bufferMemoryUsage / 1024 / 1024).toFixed(2),
      cachedBuffers: Object.keys(this.audioBuffers).length,
      pooledNodes: Object.values(this.audioPool).reduce((sum, pool) => sum + pool.length, 0),
      timeSinceLastCleanup: Date.now() - this.performanceMetrics.lastCleanup
    }
  }
  
  // Cleanup resources
  cleanup() {
    console.log('[AudioHaunting] Cleaning up audio haunting service')
    
    this.stopAllLayers()
    this.stopMemoryCleanup()
    
    // Clear all pools
    Object.keys(this.audioPool).forEach(layerName => {
      this.audioPool[layerName] = []
    })
    
    if (this.context) {
      this.context.close()
      this.context = null
    }
    
    this.audioBuffers = {}
    this.loadingBuffers.clear()
    this.initialized = false
    this.currentHeartbeatBPM = null
    
    // Reset performance metrics
    this.performanceMetrics = {
      activeAudioNodes: 0,
      bufferMemoryUsage: 0,
      lastCleanup: Date.now()
    }
    
    console.log('[AudioHaunting] Audio haunting service cleaned up')
  }
}

// Export singleton instance
export const audioHauntingService = new AudioHauntingService()
