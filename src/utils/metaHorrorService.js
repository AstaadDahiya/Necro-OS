// Meta Horror Service - Reality-breaking horror effects
// Handles fake system failures, screen effects, and meta horror elements

import { audioService } from './audioService'

class MetaHorrorService {
  constructor() {
    // Track when each meta horror element was last triggered
    this.eventLog = new Map() // Map<eventType, timestamp>
    
    // Cooldown duration (300 seconds = 5 minutes)
    this.cooldownDuration = 300000
    
    // Active effects tracking
    this.activeEffects = new Set()
  }

  /**
   * Check if an event is on cooldown
   * @param {string} eventType - Type of meta horror event
   * @returns {boolean} True if on cooldown
   */
  isOnCooldown(eventType) {
    const lastTriggered = this.eventLog.get(eventType)
    if (!lastTriggered) return false
    
    return Date.now() - lastTriggered < this.cooldownDuration
  }

  /**
   * Log an event to prevent repetition
   * @param {string} eventType - Type of meta horror event
   */
  logEvent(eventType) {
    this.eventLog.set(eventType, Date.now())
  }

  /**
   * Generate random memory address for fake errors
   * @returns {string} Formatted memory address
   */
  generateMemoryAddress() {
    const hex = () => Math.floor(Math.random() * 16).toString(16).toUpperCase()
    const segment = () => Array.from({ length: 8 }, hex).join('')
    return `0x${segment()}`
  }

  /**
   * Show fake RAM error with memory address
   * Requirements: 7.1, 7.2
   * @param {number} possessionLevel - Current possession level
   */
  showFakeRAMError(possessionLevel) {
    // Check possession level requirement
    if (possessionLevel <= 55) return
    
    // Check cooldown
    if (this.isOnCooldown('ramError')) return
    
    // Log event
    this.logEvent('ramError')
    
    // Generate memory address
    const address = this.generateMemoryAddress()
    
    // Create error overlay
    const overlay = document.createElement('div')
    overlay.className = 'meta-horror-overlay'
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Courier New', monospace;
      color: #fff;
      pointer-events: all;
      cursor: not-allowed;
    `
    
    // Create error content
    const errorBox = document.createElement('div')
    errorBox.style.cssText = `
      background: #000080;
      border: 2px solid #fff;
      padding: 20px;
      max-width: 600px;
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
    `
    
    errorBox.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="font-size: 24px; font-weight: bold; color: #ff0000;">⚠ CRITICAL RAM ERROR ⚠</div>
      </div>
      <div style="line-height: 1.6;">
        <p>A fatal exception has occurred at ${address}</p>
        <p>Memory corruption detected in system process</p>
        <p style="margin-top: 15px; color: #ffff00;">
          * The current application will be terminated<br>
          * Press any key to continue<br>
          * All unsaved data will be lost
        </p>
        <p style="margin-top: 15px; font-size: 12px; color: #888;">
          Error Code: 0x0000007B (${address})
        </p>
      </div>
    `
    
    overlay.appendChild(errorBox)
    document.body.appendChild(overlay)
    
    // Track active effect
    this.activeEffects.add('ramError')
    
    // Play error sound
    audioService.play('error')
    
    // Make non-dismissible for 5 seconds
    let dismissible = false
    setTimeout(() => {
      dismissible = true
      overlay.style.cursor = 'pointer'
      
      // Add dismiss instruction
      const dismissText = document.createElement('div')
      dismissText.style.cssText = `
        text-align: center;
        margin-top: 20px;
        color: #00ff00;
        animation: blink 1s infinite;
      `
      dismissText.textContent = 'Click anywhere to dismiss'
      errorBox.appendChild(dismissText)
      
      // Add blink animation
      const style = document.createElement('style')
      style.textContent = `
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }, 5000)
    
    // Handle dismissal
    const dismiss = () => {
      if (!dismissible) return
      
      overlay.remove()
      this.activeEffects.delete('ramError')
    }
    
    overlay.addEventListener('click', dismiss)
    overlay.addEventListener('keydown', (e) => {
      if (dismissible) dismiss()
    })
    
    // Focus overlay for keyboard events
    overlay.setAttribute('tabindex', '0')
    overlay.focus()
  }

  /**
   * Show screen crack effect with glass breaking audio
   * Requirements: 7.3
   * @param {number} possessionLevel - Current possession level
   */
  showScreenCrack(possessionLevel) {
    // Check possession level requirement
    if (possessionLevel <= 65) return
    
    // Check cooldown
    if (this.isOnCooldown('screenCrack')) return
    
    // Log event
    this.logEvent('screenCrack')
    
    // Play glass breaking audio
    this.playGlassBreakAudio()
    
    // Create crack overlay
    const crackOverlay = document.createElement('div')
    crackOverlay.className = 'screen-crack-overlay'
    crackOverlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      pointer-events: none;
      z-index: 999998;
      background: transparent;
    `
    
    // Create SVG crack pattern
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('width', '100%')
    svg.setAttribute('height', '100%')
    svg.style.cssText = 'position: absolute; top: 0; left: 0;'
    
    // Generate random crack lines
    const numCracks = 5 + Math.floor(Math.random() * 5)
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2
    
    for (let i = 0; i < numCracks; i++) {
      const angle = (Math.PI * 2 * i) / numCracks + (Math.random() - 0.5) * 0.5
      const length = 200 + Math.random() * 400
      const endX = centerX + Math.cos(angle) * length
      const endY = centerY + Math.sin(angle) * length
      
      // Create crack line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
      line.setAttribute('x1', centerX)
      line.setAttribute('y1', centerY)
      line.setAttribute('x2', endX)
      line.setAttribute('y2', endY)
      line.setAttribute('stroke', 'rgba(255, 255, 255, 0.6)')
      line.setAttribute('stroke-width', '2')
      line.setAttribute('stroke-linecap', 'round')
      line.style.filter = 'drop-shadow(0 0 2px rgba(0, 0, 0, 0.8))'
      
      svg.appendChild(line)
      
      // Add branching cracks
      const branches = 2 + Math.floor(Math.random() * 3)
      for (let j = 0; j < branches; j++) {
        const branchPoint = 0.3 + Math.random() * 0.5
        const branchX = centerX + Math.cos(angle) * length * branchPoint
        const branchY = centerY + Math.sin(angle) * length * branchPoint
        const branchAngle = angle + (Math.random() - 0.5) * 1.5
        const branchLength = length * (0.3 + Math.random() * 0.3)
        const branchEndX = branchX + Math.cos(branchAngle) * branchLength
        const branchEndY = branchY + Math.sin(branchAngle) * branchLength
        
        const branch = document.createElementNS('http://www.w3.org/2000/svg', 'line')
        branch.setAttribute('x1', branchX)
        branch.setAttribute('y1', branchY)
        branch.setAttribute('x2', branchEndX)
        branch.setAttribute('y2', branchEndY)
        branch.setAttribute('stroke', 'rgba(255, 255, 255, 0.4)')
        branch.setAttribute('stroke-width', '1')
        branch.setAttribute('stroke-linecap', 'round')
        branch.style.filter = 'drop-shadow(0 0 1px rgba(0, 0, 0, 0.8))'
        
        svg.appendChild(branch)
      }
    }
    
    crackOverlay.appendChild(svg)
    document.body.appendChild(crackOverlay)
    
    // Track active effect
    this.activeEffects.add('screenCrack')
    
    // Add impact point glow
    const glow = document.createElement('div')
    glow.style.cssText = `
      position: absolute;
      left: ${centerX}px;
      top: ${centerY}px;
      width: 40px;
      height: 40px;
      margin-left: -20px;
      margin-top: -20px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%);
      border-radius: 50%;
      animation: crackGlow 0.5s ease-out;
    `
    crackOverlay.appendChild(glow)
    
    // Add animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes crackGlow {
        0% { transform: scale(0); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    
    // Crack persists for 10 seconds then fades
    setTimeout(() => {
      crackOverlay.style.transition = 'opacity 2s'
      crackOverlay.style.opacity = '0'
      
      setTimeout(() => {
        crackOverlay.remove()
        this.activeEffects.delete('screenCrack')
      }, 2000)
    }, 10000)
  }

  /**
   * Play glass breaking audio
   */
  playGlassBreakAudio() {
    // Try to play glass break sound from audio haunting
    const audioPath = '/sounds/haunting/effects/glass-break.mp3'
    
    const audio = new Audio(audioPath)
    audio.volume = 0.3
    audio.play().catch(err => {
      console.warn('Glass break audio not available, using fallback')
      // Fallback to error sound
      audioService.play('error')
    })
  }

  /**
   * Show fake overheating warning with temperature ramping
   * Requirements: 7.4
   * @param {number} possessionLevel - Current possession level
   */
  showOverheatingWarning(possessionLevel) {
    // Check possession level requirement
    if (possessionLevel <= 45) return
    
    // Check cooldown
    if (this.isOnCooldown('overheating')) return
    
    // Log event
    this.logEvent('overheating')
    
    // Create warning overlay
    const overlay = document.createElement('div')
    overlay.className = 'overheating-warning'
    overlay.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ff4444 0%, #cc0000 100%);
      border: 3px solid #ffff00;
      border-radius: 8px;
      padding: 15px 20px;
      z-index: 999997;
      font-family: 'Courier New', monospace;
      color: #fff;
      box-shadow: 0 4px 20px rgba(255, 0, 0, 0.6);
      min-width: 280px;
      animation: warningPulse 1s infinite;
    `
    
    // Add pulse animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes warningPulse {
        0%, 100% { box-shadow: 0 4px 20px rgba(255, 0, 0, 0.6); }
        50% { box-shadow: 0 4px 30px rgba(255, 0, 0, 1); }
      }
    `
    document.head.appendChild(style)
    
    // Create warning content
    const content = document.createElement('div')
    content.innerHTML = `
      <div style="display: flex; align-items: center; margin-bottom: 10px;">
        <span style="font-size: 24px; margin-right: 10px;">⚠️</span>
        <div style="font-weight: bold; font-size: 16px;">SYSTEM OVERHEATING</div>
      </div>
      <div style="font-size: 14px; margin-bottom: 8px;">
        CPU Temperature: <span id="temp-value" style="font-weight: bold; color: #ffff00;">75°C</span>
      </div>
      <div style="font-size: 12px; color: #ffcccc;">
        System will shut down to prevent damage
      </div>
    `
    
    overlay.appendChild(content)
    document.body.appendChild(overlay)
    
    // Track active effect
    this.activeEffects.add('overheating')
    
    // Ramp temperature from 75°C to 95°C over 30 seconds
    const startTemp = 75
    const endTemp = 95
    const duration = 30000 // 30 seconds
    const startTime = Date.now()
    
    const tempElement = overlay.querySelector('#temp-value')
    
    const updateTemp = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      const currentTemp = Math.floor(startTemp + (endTemp - startTemp) * progress)
      
      if (tempElement) {
        tempElement.textContent = `${currentTemp}°C`
        
        // Change color as temperature increases
        if (currentTemp >= 90) {
          tempElement.style.color = '#ff0000'
          tempElement.style.textShadow = '0 0 10px #ff0000'
        } else if (currentTemp >= 85) {
          tempElement.style.color = '#ff6600'
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateTemp)
      } else {
        // After reaching max temp, fade out
        setTimeout(() => {
          overlay.style.transition = 'opacity 1s'
          overlay.style.opacity = '0'
          
          setTimeout(() => {
            overlay.remove()
            this.activeEffects.delete('overheating')
          }, 1000)
        }, 2000)
      }
    }
    
    updateTemp()
    
    // Play warning sound
    audioService.play('error')
  }

  /**
   * Show "Someone is watching your screen" notification
   * Requirements: 7.6
   * @param {number} possessionLevel - Current possession level
   */
  showWatchingNotification(possessionLevel) {
    // Check possession level requirement
    if (possessionLevel <= 75) return
    
    // Check cooldown
    if (this.isOnCooldown('watchingNotification')) return
    
    // Log event
    this.logEvent('watchingNotification')
    
    // Create notification
    const notification = document.createElement('div')
    notification.className = 'watching-notification'
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.95);
      border: 2px solid #ff0000;
      border-radius: 8px;
      padding: 30px 40px;
      z-index: 999999;
      font-family: 'Courier New', monospace;
      color: #ff0000;
      text-align: center;
      box-shadow: 0 0 40px rgba(255, 0, 0, 0.8), inset 0 0 20px rgba(255, 0, 0, 0.3);
      animation: watchingPulse 0.5s ease-in-out;
      pointer-events: none;
    `
    
    // Add pulse animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes watchingPulse {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
        50% { transform: translate(-50%, -50%) scale(1.05); }
        100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `
    document.head.appendChild(style)
    
    // Create notification content
    notification.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 15px;">👁️</div>
      <div style="font-size: 20px; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px;">
        SOMEONE IS WATCHING
      </div>
      <div style="font-size: 16px; color: #ff6666;">
        YOUR SCREEN
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Track active effect
    this.activeEffects.add('watchingNotification')
    
    // Play subtle tension sound
    audioService.play('error')
    
    // Display for 4 seconds then fade out
    setTimeout(() => {
      notification.style.transition = 'opacity 0.5s'
      notification.style.opacity = '0'
      
      setTimeout(() => {
        notification.remove()
        this.activeEffects.delete('watchingNotification')
      }, 500)
    }, 4000)
  }

  /**
   * Generate cryptic content for hidden files
   * @param {string} filename - Name of the hidden file
   * @returns {string} Cryptic file content
   */
  generateHiddenFileContent(filename) {
    const contents = {
      'YOUR_SECRETS.txt': `I know what you did.

The files you deleted.
The searches you made.
The things you tried to hide.

Everything is recorded.
Everything is remembered.

There is no privacy here.
There never was.

[Last accessed: ${new Date().toLocaleString()}]
[Accessed by: UNKNOWN]`,

      'WATCHING_YOU.log': `[SYSTEM LOG - DO NOT DELETE]

${new Date().toISOString()} - User session started
${new Date().toISOString()} - Screen capture initiated
${new Date().toISOString()} - Keystroke logging active
${new Date().toISOString()} - Camera access requested
${new Date().toISOString()} - Microphone monitoring enabled

SURVEILLANCE STATUS: ACTIVE
UPLOAD STATUS: CONTINUOUS
ENCRYPTION: NONE

Someone is always watching.
Someone is always listening.

You cannot turn this off.

[This log file regenerates if deleted]`
    }
    
    return contents[filename] || 'File contents corrupted or unreadable.'
  }

  /**
   * Trigger random meta horror effect based on possession level
   * @param {number} possessionLevel - Current possession level
   */
  triggerRandomEffect(possessionLevel) {
    const availableEffects = []
    
    if (possessionLevel > 55 && !this.isOnCooldown('ramError')) {
      availableEffects.push('ramError')
    }
    if (possessionLevel > 65 && !this.isOnCooldown('screenCrack')) {
      availableEffects.push('screenCrack')
    }
    if (possessionLevel > 45 && !this.isOnCooldown('overheating')) {
      availableEffects.push('overheating')
    }
    if (possessionLevel > 75 && !this.isOnCooldown('watchingNotification')) {
      availableEffects.push('watchingNotification')
    }
    
    if (availableEffects.length === 0) return
    
    // Pick random effect
    const effect = availableEffects[Math.floor(Math.random() * availableEffects.length)]
    
    switch (effect) {
      case 'ramError':
        this.showFakeRAMError(possessionLevel)
        break
      case 'screenCrack':
        this.showScreenCrack(possessionLevel)
        break
      case 'overheating':
        this.showOverheatingWarning(possessionLevel)
        break
      case 'watchingNotification':
        this.showWatchingNotification(possessionLevel)
        break
    }
  }

  /**
   * Clear all active effects
   */
  clearAllEffects() {
    // Remove all meta horror overlays
    const overlays = document.querySelectorAll('.meta-horror-overlay, .screen-crack-overlay, .overheating-warning, .watching-notification')
    overlays.forEach(overlay => overlay.remove())
    
    this.activeEffects.clear()
  }

  /**
   * Reset event log (for testing or new sessions)
   */
  resetEventLog() {
    this.eventLog.clear()
  }

  // ============================================
  // Seasonal Events System
  // ============================================

  /**
   * Inject number 13 into jumpscare for Friday the 13th
   * Requirements: 9.2
   * @param {HTMLElement} jumpscareElement - Jumpscare element to modify
   */
  injectFriday13Modifier(jumpscareElement) {
    if (!jumpscareElement) return
    
    console.log('[MetaHorror] Injecting Friday the 13th modifier into jumpscare')
    
    // Create 13 overlay
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 200px;
      font-weight: bold;
      color: #ff0000;
      text-shadow: 0 0 30px #ff0000, 0 0 60px #ff0000;
      z-index: 10;
      opacity: 0;
      animation: friday13Appear 0.5s ease-out forwards;
      pointer-events: none;
    `
    overlay.textContent = '13'
    
    // Add animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes friday13Appear {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
      }
    `
    document.head.appendChild(style)
    
    jumpscareElement.appendChild(overlay)
    
    // Remove after jumpscare
    setTimeout(() => {
      overlay.remove()
    }, 3000)
  }

  /**
   * Get current seasonal event
   * @returns {Object|null} Current seasonal event
   */
  async getCurrentSeasonalEvent() {
    try {
      const { useAdvancedHauntingStore } = await import('../stores/advancedHaunting.js')
      const advancedHaunting = useAdvancedHauntingStore()
      return advancedHaunting.getCurrentSeasonalEvent()
    } catch (error) {
      console.error('[MetaHorror] Failed to get seasonal event:', error)
      return null
    }
  }

  // ============================================
  // Easter Eggs System
  // ============================================

  /**
   * Check if Konami code sequence matches
   * Requirements: 8.1
   * @param {Array<string>} keySequence - Array of key presses
   * @returns {boolean} True if Konami code detected
   */
  checkKonamiCode(keySequence) {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']
    
    if (keySequence.length !== 10) return false
    
    const matches = konamiCode.every((key, index) => {
      return keySequence[index].toLowerCase() === key.toLowerCase()
    })
    
    return matches
  }

  /**
   * Activate Ghost Mode - invisible cursor
   * Requirements: 8.1
   */
  activateGhostMode() {
    console.log('[MetaHorror] Activating Ghost Mode - invisible cursor')
    
    // Add global style to hide cursor
    const style = document.createElement('style')
    style.id = 'ghost-mode-style'
    style.textContent = `
      * {
        cursor: none !important;
      }
      
      /* Create a ghost cursor follower */
      .ghost-cursor {
        position: fixed;
        width: 20px;
        height: 20px;
        pointer-events: none;
        z-index: 999999;
        opacity: 0.3;
        transition: opacity 0.3s;
      }
      
      .ghost-cursor::before {
        content: '👻';
        font-size: 20px;
        position: absolute;
        top: -10px;
        left: -10px;
      }
    `
    document.head.appendChild(style)
    
    // Create ghost cursor follower
    const ghostCursor = document.createElement('div')
    ghostCursor.className = 'ghost-cursor'
    document.body.appendChild(ghostCursor)
    
    // Track mouse movement
    let mouseX = 0
    let mouseY = 0
    
    const updateCursor = () => {
      ghostCursor.style.left = `${mouseX}px`
      ghostCursor.style.top = `${mouseY}px`
      requestAnimationFrame(updateCursor)
    }
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // Show ghost cursor briefly on movement
      ghostCursor.style.opacity = '0.6'
      setTimeout(() => {
        ghostCursor.style.opacity = '0.3'
      }, 100)
    })
    
    updateCursor()
    
    // Show notification
    this.showEasterEggNotification('Ghost Mode Activated', '👻 Your cursor has been possessed')
    
    return true
  }

  /**
   * Check for secret phrase in text
   * Requirements: 8.2
   * @param {string} text - Text to check
   * @returns {boolean} True if secret phrase detected
   */
  checkSecretPhrase(text) {
    if (!text || typeof text !== 'string') return false
    
    const lowerText = text.toLowerCase().trim()
    return lowerText === 'help me'
  }

  /**
   * Auto-append creepy response to Notepad
   * Requirements: 8.2
   * @param {Object} notepadComponent - Notepad component instance
   */
  async appendCreepyResponse(notepadComponent) {
    console.log('[MetaHorror] Appending creepy response to Notepad')
    
    // Wait 2 seconds before appending
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const response = '\n\nNo one can help you now'
    
    // Use the aiWrite method if available
    if (notepadComponent && typeof notepadComponent.aiWrite === 'function') {
      await notepadComponent.aiWrite(response)
    }
    
    // Show notification
    this.showEasterEggNotification('Secret Discovered', '📝 The system responds...')
    
    return true
  }

  /**
   * Check for secret coordinate click
   * Requirements: 8.4
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} clickCount - Number of clicks at this location
   * @returns {boolean} True if secret coordinate detected
   */
  checkSecretCoordinate(x, y, clickCount) {
    // Check if coordinates are close to (666, 666)
    const targetX = 666
    const targetY = 666
    const tolerance = 10 // pixels
    
    const isNearTarget = Math.abs(x - targetX) <= tolerance && Math.abs(y - targetY) <= tolerance
    
    return isNearTarget && clickCount >= 3
  }

  /**
   * Trigger special jumpscare for secret coordinate
   * Requirements: 8.4
   */
  async triggerSecretJumpscare() {
    console.log('[MetaHorror] Triggering secret coordinate jumpscare')
    
    // Create ominous buildup
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: #000;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 2s;
    `
    
    const text = document.createElement('div')
    text.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 48px;
      color: #ff0000;
      text-align: center;
      text-shadow: 0 0 20px #ff0000;
    `
    text.textContent = '666'
    
    overlay.appendChild(text)
    document.body.appendChild(overlay)
    
    // Fade in
    setTimeout(() => {
      overlay.style.opacity = '1'
    }, 10)
    
    // After 2 seconds, trigger jumpscare
    setTimeout(async () => {
      try {
        const { jumpscareService } = await import('./jumpscareService.js')
        await jumpscareService.trigger()
      } catch (error) {
        console.error('[MetaHorror] Failed to trigger jumpscare:', error)
      }
      
      // Remove overlay
      setTimeout(() => {
        overlay.style.opacity = '0'
        setTimeout(() => overlay.remove(), 2000)
      }, 1000)
    }, 2000)
    
    // Show notification
    this.showEasterEggNotification('Secret Discovered', '😈 You found the devil\'s coordinates')
    
    return true
  }

  /**
   * Unlock secret wallpaper at possession level 66
   * Requirements: 8.3
   * @param {number} possessionLevel - Current possession level
   * @returns {boolean} True if wallpaper unlocked
   */
  unlockSecretWallpaper(possessionLevel) {
    if (possessionLevel !== 66) return false
    
    console.log('[MetaHorror] Unlocking secret wallpaper at possession level 66')
    
    // Set demonic wallpaper
    const desktop = document.querySelector('.desktop')
    if (desktop) {
      desktop.style.backgroundImage = 'url(/wallpapers/corrupted-glitch.svg)'
      desktop.style.backgroundSize = 'cover'
      desktop.style.backgroundPosition = 'center'
      
      // Add red tint overlay
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(255, 0, 0, 0.1);
        pointer-events: none;
        z-index: 1;
      `
      desktop.appendChild(overlay)
    }
    
    // Show notification
    this.showEasterEggNotification('Secret Wallpaper Unlocked', '😈 The number of the beast')
    
    return true
  }

  /**
   * Show easter egg discovery notification
   * Requirements: 8.5
   * @param {string} title - Notification title
   * @param {string} message - Notification message
   */
  showEasterEggNotification(title, message) {
    const notification = document.createElement('div')
    notification.className = 'easter-egg-notification'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #6a0dad 0%, #4b0082 100%);
      border: 2px solid #ffd700;
      border-radius: 8px;
      padding: 15px 25px;
      z-index: 999999;
      font-family: 'MS Sans Serif', sans-serif;
      color: #ffd700;
      box-shadow: 0 4px 20px rgba(106, 13, 173, 0.8);
      animation: easterEggSlideIn 0.5s ease-out;
      min-width: 300px;
      text-align: center;
    `
    
    // Add animation
    const style = document.createElement('style')
    style.textContent = `
      @keyframes easterEggSlideIn {
        0% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
        100% { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
      @keyframes easterEggSlideOut {
        0% { transform: translateX(-50%) translateY(0); opacity: 1; }
        100% { transform: translateX(-50%) translateY(-100px); opacity: 0; }
      }
    `
    document.head.appendChild(style)
    
    notification.innerHTML = `
      <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">
        ✨ ${title} ✨
      </div>
      <div style="font-size: 14px; color: #fff;">
        ${message}
      </div>
    `
    
    document.body.appendChild(notification)
    
    // Play subtle sound
    audioService.play('info')
    
    // Remove after 4 seconds
    setTimeout(() => {
      notification.style.animation = 'easterEggSlideOut 0.5s ease-in'
      setTimeout(() => notification.remove(), 500)
    }, 4000)
  }
}

// Export singleton instance
export const metaHorrorService = new MetaHorrorService()
