import { defineStore, storeToRefs } from 'pinia'
import { watch } from 'vue'
import geminiService from '../utils/geminiService'
import { useWindowManagerStore } from './windowManager'
import { useGhostBehaviorStore } from './ghostBehavior'

export const useVisualCorruptionStore = defineStore('visualCorruption', {
  state: () => ({
    // CRT Filter state
    crtIntensity: 1,
    crtFlickerActive: false,
    crtBarrelDistortion: 3,
    
    // Cursor Corruption state
    cursorCorruption: {
      enabled: false,
      rotation: 0,
      trailEnabled: false,
      glitchFrequency: 0,
      teleportEnabled: false,
      autonomousEnabled: false
    },
    
    // Desktop Corruption state
    desktopCorruption: {
      iconOffsets: new Map(),
      ghostIcons: [],
      backgroundDarkness: 0,
      wallpaperFlickerActive: false,
      maxGhostIcons: 10,
      iconMovementTimer: null,
      iconDuplicationTimer: null,
      backgroundDarkeningTimer: null,
      iconCorruptionFilters: new Map(),
      corruptedWallpaper: null,
      originalWallpaper: '#008080',
      // Wallpaper flicker state
      flickerWallpapers: [
        '/wallpapers/flicker/ghost1.svg',
        '/wallpapers/flicker/ghost2.svg',
        '/wallpapers/flicker/ghost3.svg',
        '/wallpapers/flicker/ghost4.svg',
        '/wallpapers/flicker/ghost5.svg',
        '/wallpapers/flicker/ghost6.svg',
        '/wallpapers/flicker/ghost7.svg',
        '/wallpapers/flicker/ghost8.svg'
      ],
      currentFlickerWallpaper: null,
      flickerTimer: null,
      flickerInterval: 30000, // 30 seconds default (20-40 range)
      isFlickering: false
    },
    
    // Phantom Notifications state
    phantomNotifications: {
      enabled: false,
      interval: 90000, // 90 seconds (increased from 45)
      queue: [],
      maxConcurrent: 2, // Reduced from 3
      nextNotificationTimer: null
    },
    
    // Terminal Popups state
    terminalPopups: {
      enabled: false,
      maxConcurrent: 2,
      activeWindows: [],
      spawnInterval: 67500, // 67.5 seconds (45-90 range)
      nextTerminalTimer: null
    },
    
    // Disk Space Warnings state
    diskSpaceWarnings: {
      enabled: false,
      activeWarnings: [],
      maxConcurrent: 5,
      nextWarningId: 1
    },
    
    // Context Menu Corruption state
    contextMenuCorruption: {
      enabled: false,
      corruptionChance: 0.3, // 30% at level 3
      currentOffset: null,
      currentRotation: 0
    }
  }),

  getters: {
    // Get current CRT settings
    currentCRTSettings: (state) => ({
      intensity: state.crtIntensity,
      flickerActive: state.crtFlickerActive,
      barrelDistortion: state.crtBarrelDistortion
    }),
    
    // Check if cursor corruption is active
    isCursorCorrupted: (state) => state.cursorCorruption.enabled,
    
    // Get active ghost icons count
    ghostIconCount: (state) => state.desktopCorruption.ghostIcons.length,
    
    // Get active notifications
    activeNotifications: (state) => state.phantomNotifications.queue,
    
    // Check if terminal can spawn
    canSpawnTerminal: (state) => {
      return state.terminalPopups.enabled && 
             state.terminalPopups.activeWindows.length < state.terminalPopups.maxConcurrent
    },
    
    // Get active disk space warnings
    activeDiskSpaceWarnings: (state) => state.diskSpaceWarnings.activeWarnings,
    
    // Check if disk space warning can spawn
    canSpawnDiskSpaceWarning: (state) => {
      return state.diskSpaceWarnings.enabled &&
             state.diskSpaceWarnings.activeWarnings.length < state.diskSpaceWarnings.maxConcurrent
    }
  },

  actions: {
    // ============================================
    // Feature Check
    // ============================================
    
    isFeatureEnabled() {
      try {
        // Dynamically import to avoid circular dependency
        const { useAdvancedHauntingStore } = require('./advancedHaunting')
        const advancedHaunting = useAdvancedHauntingStore()
        return advancedHaunting.isFeatureEnabled('visualCorruption')
      } catch (error) {
        // Default to enabled if store not available
        return true
      }
    },
    
    // ============================================
    // CRT Filter Actions
    // ============================================
    
    updateCRTIntensity(hauntingLevel) {
      if (!this.isFeatureEnabled()) {
        return
      }
      
      this.crtIntensity = hauntingLevel
      
      // Enable flicker at level 3+ (unless disabled for accessibility)
      const disableFlicker = localStorage.getItem('necro-os-disable-flicker') === 'true'
      if (hauntingLevel >= 3 && !disableFlicker) {
        this.crtFlickerActive = true
      } else {
        this.crtFlickerActive = false
      }
      
      // Increase barrel distortion at level 5+
      if (hauntingLevel >= 5) {
        this.crtBarrelDistortion = 8
      } else {
        this.crtBarrelDistortion = 3
      }
      
      console.log(`[VisualCorruption] CRT intensity updated to level ${hauntingLevel}`)
    },

    // ============================================
    // Cursor Corruption Actions
    // ============================================
    
    enableCursorCorruption(level) {
      if (!this.isFeatureEnabled()) {
        return
      }
      
      this.cursorCorruption.enabled = true
      
      // Level 2: Rotation
      if (level >= 2) {
        this.cursorCorruption.rotation = Math.random() * 30 + 15 // 15-45 degrees
      }
      
      // Level 3: Ghost trail
      if (level >= 3) {
        this.cursorCorruption.trailEnabled = true
      }
      
      // Level 4: Glitch effect
      if (level >= 4) {
        this.cursorCorruption.glitchFrequency = 5000 // Every 5 seconds
      }
      
      // Level 5: Teleportation and autonomous movement
      if (level >= 5) {
        this.cursorCorruption.teleportEnabled = true
        this.cursorCorruption.autonomousEnabled = true
      }
      
      console.log(`[VisualCorruption] Cursor corruption enabled at level ${level}`)
    },
    
    disableCursorCorruption() {
      this.cursorCorruption.enabled = false
      this.cursorCorruption.rotation = 0
      this.cursorCorruption.trailEnabled = false
      this.cursorCorruption.glitchFrequency = 0
      this.cursorCorruption.teleportEnabled = false
      this.cursorCorruption.autonomousEnabled = false
    },

    // ============================================
    // Desktop Corruption Actions
    // ============================================
    
    moveDesktopIcon(iconId) {
      // Debounce: Check if icon was moved recently (within 1 second)
      const lastMoveTime = this.desktopCorruption.iconLastMoveTime?.get(iconId) || 0
      const now = Date.now()
      
      if (now - lastMoveTime < 1000) {
        console.log(`[VisualCorruption] Icon ${iconId} move debounced`)
        return
      }
      
      // Calculate random offset (10-30 pixels)
      const offset = {
        x: Math.random() * 20 + 10,
        y: Math.random() * 20 + 10
      }
      
      // Randomly make it negative
      if (Math.random() > 0.5) offset.x = -offset.x
      if (Math.random() > 0.5) offset.y = -offset.y
      
      this.desktopCorruption.iconOffsets.set(iconId, offset)
      
      // Track last move time
      if (!this.desktopCorruption.iconLastMoveTime) {
        this.desktopCorruption.iconLastMoveTime = new Map()
      }
      this.desktopCorruption.iconLastMoveTime.set(iconId, now)
      
      console.log(`[VisualCorruption] Moved icon ${iconId} by (${offset.x}, ${offset.y})`)
    },
    
    duplicateIcon(iconId, iconData) {
      // Check if we've reached the max ghost icons - remove oldest
      while (this.desktopCorruption.ghostIcons.length >= this.desktopCorruption.maxGhostIcons) {
        const removed = this.desktopCorruption.ghostIcons.shift()
        console.log(`[VisualCorruption] Max ghost icons reached, removed oldest: ${removed.id}`)
      }
      
      // Count existing ghosts for this icon
      const existingGhosts = this.desktopCorruption.ghostIcons.filter(
        ghost => ghost.originalIconId === iconId
      ).length
      
      // Limit to 5 ghosts per icon
      if (existingGhosts >= 5) {
        console.log(`[VisualCorruption] Icon ${iconId} already has 5 ghosts`)
        return
      }
      
      // Create ghost icon with timestamp for age tracking
      const ghostIcon = {
        id: `ghost-${Date.now()}-${Math.random()}`,
        originalIconId: iconId,
        x: Math.random() * 40 - 20, // -20 to 20 pixels offset
        y: Math.random() * 40 - 20,
        opacity: 0.5,
        createdAt: Date.now(),
        ...iconData
      }
      
      this.desktopCorruption.ghostIcons.push(ghostIcon)
      
      console.log(`[VisualCorruption] Created ghost icon for ${iconId} (total: ${this.desktopCorruption.ghostIcons.length})`)
    },
    
    removeGhostIcon(ghostId) {
      const index = this.desktopCorruption.ghostIcons.findIndex(g => g.id === ghostId)
      if (index !== -1) {
        this.desktopCorruption.ghostIcons.splice(index, 1)
      }
    },
    
    clearGhostIcons() {
      this.desktopCorruption.ghostIcons = []
      console.log('[VisualCorruption] Cleared all ghost icons')
    },
    
    darkenBackground() {
      this.desktopCorruption.backgroundDarkness = Math.min(
        this.desktopCorruption.backgroundDarkness + 10,
        50 // Max 50% darkening
      )
      console.log(`[VisualCorruption] Background darkness: ${this.desktopCorruption.backgroundDarkness}%`)
    },
    
    startIconMovement() {
      if (this.desktopCorruption.iconMovementTimer) {
        return // Already running
      }
      
      // Trigger movement every 60 seconds
      this.desktopCorruption.iconMovementTimer = setInterval(() => {
        // Get all desktop icons and randomly move one
        const iconIds = ['mycomputer', 'recyclebin', 'ie', 'notepad', 'soulscanner', 'spiritboard']
        const randomIcon = iconIds[Math.floor(Math.random() * iconIds.length)]
        this.moveDesktopIcon(randomIcon)
      }, 60000) // 60 seconds
      
      console.log('[VisualCorruption] Started icon movement system')
    },
    
    stopIconMovement() {
      if (this.desktopCorruption.iconMovementTimer) {
        clearInterval(this.desktopCorruption.iconMovementTimer)
        this.desktopCorruption.iconMovementTimer = null
      }
      console.log('[VisualCorruption] Stopped icon movement system')
    },
    
    startIconDuplication(iconIds) {
      if (this.desktopCorruption.iconDuplicationTimer) {
        return // Already running
      }
      
      // Trigger duplication every 45 seconds
      this.desktopCorruption.iconDuplicationTimer = setInterval(() => {
        const randomIcon = iconIds[Math.floor(Math.random() * iconIds.length)]
        const iconData = {
          name: randomIcon,
          app: randomIcon
        }
        this.duplicateIcon(randomIcon, iconData)
      }, 45000) // 45 seconds
      
      console.log('[VisualCorruption] Started icon duplication system')
    },
    
    stopIconDuplication() {
      if (this.desktopCorruption.iconDuplicationTimer) {
        clearInterval(this.desktopCorruption.iconDuplicationTimer)
        this.desktopCorruption.iconDuplicationTimer = null
      }
      console.log('[VisualCorruption] Stopped icon duplication system')
    },
    
    startBackgroundDarkening() {
      if (this.desktopCorruption.backgroundDarkeningTimer) {
        return // Already running
      }
      
      // Darken every 30 seconds
      this.desktopCorruption.backgroundDarkeningTimer = setInterval(() => {
        this.darkenBackground()
      }, 30000) // 30 seconds
      
      console.log('[VisualCorruption] Started background darkening system')
    },
    
    stopBackgroundDarkening() {
      if (this.desktopCorruption.backgroundDarkeningTimer) {
        clearInterval(this.desktopCorruption.backgroundDarkeningTimer)
        this.desktopCorruption.backgroundDarkeningTimer = null
      }
      // Reset darkness
      this.desktopCorruption.backgroundDarkness = 0
      console.log('[VisualCorruption] Stopped background darkening system')
    },
    
    applyIconCorruptionFilter(iconId) {
      // Generate random filter values
      const hueRotate = Math.random() * 360 // 0-360 degrees
      const invert = Math.random() * 0.5 // 0-50% invert
      
      const filter = {
        hueRotate,
        invert
      }
      
      this.desktopCorruption.iconCorruptionFilters.set(iconId, filter)
      console.log(`[VisualCorruption] Applied corruption filter to ${iconId}`)
    },
    
    replaceWallpaper() {
      // Store original if not already stored
      if (!this.desktopCorruption.corruptedWallpaper) {
        this.desktopCorruption.originalWallpaper = '#008080'
      }
      
      // Set corrupted wallpaper (glitch pattern)
      this.desktopCorruption.corruptedWallpaper = 'corrupted'
      console.log('[VisualCorruption] Replaced wallpaper with corrupted version')
    },
    
    restoreWallpaper() {
      this.desktopCorruption.corruptedWallpaper = null
      console.log('[VisualCorruption] Restored original wallpaper')
    },
    
    fadeOutGhostIcons() {
      // Mark all ghost icons for fade out
      this.desktopCorruption.ghostIcons.forEach(ghost => {
        ghost.fadingOut = true
      })
      
      // Remove them after 2 seconds
      setTimeout(() => {
        this.clearGhostIcons()
      }, 2000)
      
      console.log('[VisualCorruption] Fading out ghost icons')
    },
    
    // ============================================
    // Wallpaper Flicker Actions
    // ============================================
    
    triggerWallpaperFlicker() {
      // Check accessibility preference
      const disableFlicker = localStorage.getItem('necro-os-disable-flicker') === 'true'
      if (disableFlicker) {
        console.log('[VisualCorruption] Wallpaper flicker disabled via accessibility settings')
        return
      }
      
      if (this.desktopCorruption.isFlickering) {
        return // Already flickering
      }
      
      // Throttle: Check if flicker was triggered recently (within 5 seconds minimum)
      const lastFlickerTime = this.desktopCorruption.lastFlickerTime || 0
      const now = Date.now()
      
      if (now - lastFlickerTime < 5000) {
        console.log('[VisualCorruption] Wallpaper flicker throttled')
        return
      }
      
      this.desktopCorruption.lastFlickerTime = now
      
      // Select random ghostly wallpaper from collection
      const wallpapers = this.desktopCorruption.flickerWallpapers
      const randomIndex = Math.floor(Math.random() * wallpapers.length)
      const flickerWallpaper = wallpapers[randomIndex]
      
      // Store original wallpaper if not already stored
      if (!this.desktopCorruption.currentFlickerWallpaper) {
        this.desktopCorruption.originalWallpaper = '#008080'
      }
      
      // Set flicker state
      this.desktopCorruption.isFlickering = true
      this.desktopCorruption.currentFlickerWallpaper = flickerWallpaper
      
      console.log(`[VisualCorruption] Wallpaper flicker triggered: ${flickerWallpaper}`)
      
      // Calculate random duration (100-300ms)
      const flickerDuration = 100 + Math.random() * 200
      
      // Revert after duration
      setTimeout(() => {
        this.desktopCorruption.currentFlickerWallpaper = null
        this.desktopCorruption.isFlickering = false
        console.log('[VisualCorruption] Wallpaper flicker reverted')
      }, flickerDuration)
    },
    
    startWallpaperFlicker(hauntingLevel) {
      if (this.desktopCorruption.flickerTimer) {
        return // Already running
      }
      
      // Set interval based on haunting level
      if (hauntingLevel >= 5) {
        // Level 5: 10-20 seconds
        this.desktopCorruption.flickerInterval = 15000 // 15 seconds average
      } else {
        // Level 3-4: 20-40 seconds
        this.desktopCorruption.flickerInterval = 30000 // 30 seconds average
      }
      
      // Schedule first flicker
      this.scheduleNextFlicker()
      
      console.log(`[VisualCorruption] Started wallpaper flicker system with ${this.desktopCorruption.flickerInterval}ms interval`)
    },
    
    scheduleNextFlicker() {
      if (!this.desktopCorruption.flickerTimer && this.desktopCorruption.flickerInterval > 0) {
        // Calculate random delay based on interval
        const baseInterval = this.desktopCorruption.flickerInterval
        const minDelay = baseInterval * 0.67 // -33%
        const maxDelay = baseInterval * 1.33 // +33%
        const randomDelay = minDelay + Math.random() * (maxDelay - minDelay)
        
        this.desktopCorruption.flickerTimer = setTimeout(() => {
          this.triggerWallpaperFlicker()
          this.desktopCorruption.flickerTimer = null
          this.scheduleNextFlicker() // Schedule next one
        }, randomDelay)
        
        console.log(`[VisualCorruption] Next wallpaper flicker scheduled in ${Math.round(randomDelay / 1000)}s`)
      }
    },
    
    stopWallpaperFlicker() {
      if (this.desktopCorruption.flickerTimer) {
        clearTimeout(this.desktopCorruption.flickerTimer)
        this.desktopCorruption.flickerTimer = null
      }
      
      // Reset flicker state
      this.desktopCorruption.currentFlickerWallpaper = null
      this.desktopCorruption.isFlickering = false
      
      console.log('[VisualCorruption] Stopped wallpaper flicker system')
    },

    // ============================================
    // Phantom Notification Actions
    // ============================================
    
    async generatePhantomNotification() {
      try {
        // Enforce limit: Remove oldest notification if at max
        if (this.phantomNotifications.queue.length >= this.phantomNotifications.maxConcurrent) {
          const oldestNotification = this.phantomNotifications.queue.shift()
          console.log(`[VisualCorruption] Removed oldest notification ${oldestNotification.id} to enforce limit`)
        }
        
        // Build prompt for creepy notification
        const prompt = `Generate a single creepy Windows 95 system notification message. 
Make it sound like a real system warning but with supernatural undertones. 
Keep it under 60 characters. 
Examples: "Low memory: 666 KB available", "Warning: soul.exe is not responding", "Error: Ghost process detected"
Only respond with the notification text, nothing else.`
        
        const message = await geminiService.chat(prompt)
        
        // Clean up the message (remove quotes if present)
        const cleanMessage = message.replace(/^["']|["']$/g, '').trim()
        
        // Create notification object
        const notification = {
          id: `notif-${Date.now()}`,
          message: cleanMessage,
          type: 'warning',
          icon: 'warning',
          timestamp: Date.now(),
          duration: 5000,
          dismissible: false
        }
        
        this.phantomNotifications.queue.push(notification)
        console.log(`[VisualCorruption] Generated phantom notification: ${cleanMessage}`)
        
        // Auto-remove after duration
        setTimeout(() => {
          this.removeNotification(notification.id)
        }, notification.duration)
        
        return notification
      } catch (error) {
        console.error('[VisualCorruption] Failed to generate phantom notification:', error)
        
        // Enforce limit: Remove oldest notification if at max
        if (this.phantomNotifications.queue.length >= this.phantomNotifications.maxConcurrent) {
          const oldestNotification = this.phantomNotifications.queue.shift()
          console.log(`[VisualCorruption] Removed oldest notification ${oldestNotification.id} to enforce limit`)
        }
        
        // Fallback to predefined messages
        const fallbackMessages = [
          'Low memory: 666 KB available',
          'Warning: soul.exe is not responding',
          'Error: Ghost process detected',
          'Critical: haunt.dll failed to load',
          'System error: Entity 404 not found',
          'Warning: Spectral overflow detected'
        ]
        
        const message = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)]
        
        const notification = {
          id: `notif-${Date.now()}`,
          message,
          type: 'warning',
          icon: 'warning',
          timestamp: Date.now(),
          duration: 5000,
          dismissible: false
        }
        
        this.phantomNotifications.queue.push(notification)
        
        setTimeout(() => {
          this.removeNotification(notification.id)
        }, notification.duration)
        
        return notification
      }
    },
    
    removeNotification(notificationId) {
      const index = this.phantomNotifications.queue.findIndex(n => n.id === notificationId)
      if (index !== -1) {
        this.phantomNotifications.queue.splice(index, 1)
        console.log(`[VisualCorruption] Removed notification ${notificationId}`)
      }
    },
    
    startPhantomNotifications(hauntingLevel) {
      if (this.phantomNotifications.enabled) {
        return // Already running
      }
      
      this.phantomNotifications.enabled = true
      
      // Adjust interval based on haunting level
      if (hauntingLevel >= 4) {
        this.phantomNotifications.interval = 60000 // 60 seconds (40-90 range) - increased from 22.5s
      } else {
        this.phantomNotifications.interval = 90000 // 90 seconds (60-135 range) - increased from 45s
      }
      
      // Schedule first notification
      this.scheduleNextNotification()
      
      console.log(`[VisualCorruption] Started phantom notifications with ${this.phantomNotifications.interval}ms interval`)
    },
    
    scheduleNextNotification() {
      if (!this.phantomNotifications.enabled) {
        return
      }
      
      // Clear existing timer
      if (this.phantomNotifications.nextNotificationTimer) {
        clearTimeout(this.phantomNotifications.nextNotificationTimer)
      }
      
      // Calculate random delay based on interval
      const baseInterval = this.phantomNotifications.interval
      const randomDelay = baseInterval + (Math.random() * baseInterval * 0.5) // +0-50% variation
      
      this.phantomNotifications.nextNotificationTimer = setTimeout(() => {
        this.generatePhantomNotification()
        this.scheduleNextNotification() // Schedule next one
      }, randomDelay)
    },
    
    stopPhantomNotifications() {
      this.phantomNotifications.enabled = false
      
      if (this.phantomNotifications.nextNotificationTimer) {
        clearTimeout(this.phantomNotifications.nextNotificationTimer)
        this.phantomNotifications.nextNotificationTimer = null
      }
      
      console.log('[VisualCorruption] Stopped phantom notifications')
    },

    // ============================================
    // Terminal Popup Actions
    // ============================================
    
    async spawnTerminalPopup() {
      if (!this.terminalPopups.enabled) {
        console.log('[VisualCorruption] Cannot spawn terminal: disabled')
        return null
      }
      
      const windowManager = useWindowManagerStore()
      
      // Enforce limit: Close oldest terminal if at max
      if (this.terminalPopups.activeWindows.length >= this.terminalPopups.maxConcurrent) {
        const oldestTerminalId = this.terminalPopups.activeWindows.shift()
        windowManager.closeWindow(oldestTerminalId)
        console.log(`[VisualCorruption] Closed oldest terminal ${oldestTerminalId} to enforce limit`)
      }
      
      // Calculate random position
      const x = Math.random() * 400 + 100
      const y = Math.random() * 300 + 100
      
      // Open terminal window
      const window = windowManager.openWindow('terminal', {
        title: 'C:\\WINDOWS\\system32\\cmd.exe',
        x,
        y,
        width: 600,
        height: 400,
        icon: 'terminal'
      })
      
      if (window) {
        this.terminalPopups.activeWindows.push(window.id)
        console.log(`[VisualCorruption] Spawned terminal popup at (${x}, ${y})`)
      }
      
      return window
    },
    
    removeTerminalWindow(windowId) {
      const index = this.terminalPopups.activeWindows.indexOf(windowId)
      if (index !== -1) {
        this.terminalPopups.activeWindows.splice(index, 1)
        console.log(`[VisualCorruption] Removed terminal window ${windowId}`)
      }
    },
    
    startTerminalPopups() {
      if (this.terminalPopups.enabled) {
        return // Already running
      }
      
      this.terminalPopups.enabled = true
      
      // Schedule first terminal popup
      this.scheduleNextTerminal()
      
      console.log('[VisualCorruption] Started terminal popup system')
    },
    
    scheduleNextTerminal() {
      if (!this.terminalPopups.enabled) {
        return
      }
      
      // Clear existing timer
      if (this.terminalPopups.nextTerminalTimer) {
        clearTimeout(this.terminalPopups.nextTerminalTimer)
      }
      
      // Calculate random delay (45-90 seconds)
      const minDelay = 45000 // 45 seconds
      const maxDelay = 90000 // 90 seconds
      const randomDelay = minDelay + Math.random() * (maxDelay - minDelay)
      
      this.terminalPopups.nextTerminalTimer = setTimeout(() => {
        this.spawnTerminalPopup()
        this.scheduleNextTerminal() // Schedule next one
      }, randomDelay)
      
      console.log(`[VisualCorruption] Next terminal scheduled in ${Math.round(randomDelay / 1000)}s`)
    },
    
    stopTerminalPopups() {
      this.terminalPopups.enabled = false
      
      if (this.terminalPopups.nextTerminalTimer) {
        clearTimeout(this.terminalPopups.nextTerminalTimer)
        this.terminalPopups.nextTerminalTimer = null
      }
      
      console.log('[VisualCorruption] Stopped terminal popup system')
    },

    // ============================================
    // Disk Space Warning Actions
    // ============================================
    
    spawnDiskSpaceWarning(hauntingLevel = 2) {
      if (!this.canSpawnDiskSpaceWarning) {
        console.log('[VisualCorruption] Cannot spawn disk space warning: limit reached or disabled')
        return null
      }
      
      // Calculate offset for multiple warnings
      const warningCount = this.diskSpaceWarnings.activeWarnings.length
      const offset = {
        x: warningCount * 20,
        y: warningCount * 20
      }
      
      // Create warning object
      const warning = {
        id: `disk-warning-${this.diskSpaceWarnings.nextWarningId++}`,
        offset,
        timestamp: Date.now()
      }
      
      this.diskSpaceWarnings.activeWarnings.push(warning)
      console.log(`[VisualCorruption] Spawned disk space warning ${warning.id}`)
      
      // At haunting level 4+, spawn additional warnings
      if (hauntingLevel >= 4 && this.diskSpaceWarnings.activeWarnings.length < 3) {
        setTimeout(() => {
          this.spawnDiskSpaceWarning(hauntingLevel)
        }, 2000)
      }
      
      return warning
    },
    
    removeDiskSpaceWarning(warningId) {
      const index = this.diskSpaceWarnings.activeWarnings.findIndex(w => w.id === warningId)
      if (index !== -1) {
        this.diskSpaceWarnings.activeWarnings.splice(index, 1)
        console.log(`[VisualCorruption] Removed disk space warning ${warningId}`)
      }
    },
    
    startDiskSpaceWarnings() {
      if (this.diskSpaceWarnings.enabled) {
        return // Already running
      }
      
      this.diskSpaceWarnings.enabled = true
      console.log('[VisualCorruption] Started disk space warning system')
    },
    
    stopDiskSpaceWarnings() {
      this.diskSpaceWarnings.enabled = false
      this.diskSpaceWarnings.activeWarnings = []
      console.log('[VisualCorruption] Stopped disk space warning system')
    },

    // ============================================
    // Context Menu Corruption Actions
    // ============================================
    
    calculateContextMenuCorruption(x, y, hauntingLevel) {
      // Check if corruption should trigger based on probability
      const shouldCorrupt = Math.random() < this.contextMenuCorruption.corruptionChance
      
      if (!shouldCorrupt || !this.contextMenuCorruption.enabled) {
        return null
      }
      
      // Calculate random offset (100-200 pixels)
      const offsetDistance = 100 + Math.random() * 100
      const offsetAngle = Math.random() * Math.PI * 2
      const offsetX = Math.cos(offsetAngle) * offsetDistance
      const offsetY = Math.sin(offsetAngle) * offsetDistance
      
      // Calculate random rotation (5-15 degrees)
      let rotation = 5 + Math.random() * 10
      
      // Randomly make rotation negative
      if (Math.random() > 0.5) {
        rotation = -rotation
      }
      
      // 20% chance for upside-down menu (180 degrees)
      if (Math.random() < 0.2) {
        rotation = 180
      }
      
      const corruption = {
        x: x + offsetX,
        y: y + offsetY,
        rotation
      }
      
      console.log(`[VisualCorruption] Context menu corrupted: offset (${Math.round(offsetX)}, ${Math.round(offsetY)}), rotation ${Math.round(rotation)}°`)
      
      return corruption
    },
    
    enableContextMenuCorruption(hauntingLevel) {
      this.contextMenuCorruption.enabled = true
      
      // Set corruption chance based on haunting level
      if (hauntingLevel >= 5) {
        this.contextMenuCorruption.corruptionChance = 0.6 // 60% at level 5
      } else {
        this.contextMenuCorruption.corruptionChance = 0.3 // 30% at level 3
      }
      
      console.log(`[VisualCorruption] Context menu corruption enabled with ${this.contextMenuCorruption.corruptionChance * 100}% chance`)
    },
    
    disableContextMenuCorruption() {
      this.contextMenuCorruption.enabled = false
      this.contextMenuCorruption.currentOffset = null
      this.contextMenuCorruption.currentRotation = 0
      console.log('[VisualCorruption] Context menu corruption disabled')
    },

    // ============================================
    // Integration with Ghost Behavior
    // ============================================
    
    initializeHauntingIntegration() {
      try {
        const ghostBehavior = useGhostBehaviorStore()
        const { hauntingLevel } = storeToRefs(ghostBehavior)
        
        // Watch for haunting level changes using Vue's watch
        watch(hauntingLevel, (newLevel, oldLevel) => {
          console.log(`[VisualCorruption] Haunting level changed from ${oldLevel} to ${newLevel}`)
          this.updateFromHauntingLevel(newLevel)
        }, { immediate: false })
        
        // Initialize with current haunting level
        this.updateFromHauntingLevel(ghostBehavior.hauntingLevel)
        
        console.log('[VisualCorruption] Initialized haunting integration with level', ghostBehavior.hauntingLevel)
      } catch (error) {
        console.error('[VisualCorruption] Failed to initialize haunting integration:', error)
      }
    },
    
    updateFromHauntingLevel(level) {
      console.log(`[VisualCorruption] Updating effects for haunting level ${level}`)
      
      // Update CRT intensity
      this.updateCRTIntensity(level)
      
      // Level 2+: Enable cursor corruption, phantom notifications, disk space warnings, and icon movement
      if (level >= 2) {
        this.enableCursorCorruption(level)
        this.startPhantomNotifications(level)
        this.startDiskSpaceWarnings()
        this.startIconMovement()
        
        // Spawn initial disk space warning (only at level 2, not every time)
        if (this.diskSpaceWarnings.activeWarnings.length === 0 && level === 2) {
          this.spawnDiskSpaceWarning(level)
        }
      } else {
        this.disableCursorCorruption()
        this.stopPhantomNotifications()
        this.stopDiskSpaceWarnings()
        this.stopIconMovement()
      }
      
      // Level 3+: Enable terminal popups, icon duplication, wallpaper flicker, and context menu corruption
      if (level >= 3) {
        this.startTerminalPopups()
        const iconIds = ['mycomputer', 'recyclebin', 'ie', 'notepad', 'soulscanner', 'spiritboard']
        this.startIconDuplication(iconIds)
        this.startWallpaperFlicker(level)
        this.enableContextMenuCorruption(level)
      } else {
        this.stopTerminalPopups()
        this.stopIconDuplication()
        this.fadeOutGhostIcons()
        this.stopWallpaperFlicker()
        this.disableContextMenuCorruption()
      }
      
      // Level 4+: Increase notification frequency, spawn multiple disk warnings, and start background darkening
      if (level >= 4) {
        if (this.phantomNotifications.enabled) {
          this.phantomNotifications.interval = 60000 // 60 seconds - increased from 22.5s
        }
        
        // Spawn additional disk space warnings (only spawn 1 more at level 4, not continuously)
        if (this.diskSpaceWarnings.activeWarnings.length < 1 && level === 4) {
          this.spawnDiskSpaceWarning(level)
        }
        
        this.startBackgroundDarkening()
        
        // Apply corruption filters to icons
        const iconIds = ['mycomputer', 'recyclebin', 'ie', 'notepad', 'soulscanner', 'spiritboard']
        iconIds.forEach(iconId => {
          if (!this.desktopCorruption.iconCorruptionFilters.has(iconId)) {
            this.applyIconCorruptionFilter(iconId)
          }
        })
      } else {
        this.stopBackgroundDarkening()
        this.desktopCorruption.iconCorruptionFilters.clear()
      }
      
      // Level 5+: Maximum chaos - replace wallpaper and increase context menu corruption
      if (level >= 5) {
        this.enableCursorCorruption(level)
        this.replaceWallpaper()
        this.enableContextMenuCorruption(level) // Update corruption chance to 60%
      } else {
        this.restoreWallpaper()
      }
    },
    
    // ============================================
    // Haunting Integration (REMOVED DUPLICATE)
    // ============================================
    // This method was a duplicate and has been removed.
    // The correct initializeHauntingIntegration() is defined above around line 890
    
    // ============================================
    // Cleanup
    // ============================================
    
    cleanup() {
      // Stop all timers and intervals
      this.stopPhantomNotifications()
      this.stopTerminalPopups()
      this.stopDiskSpaceWarnings()
      this.stopIconMovement()
      this.stopIconDuplication()
      this.stopBackgroundDarkening()
      this.stopWallpaperFlicker()
      this.disableCursorCorruption()
      this.disableContextMenuCorruption()
      
      // Clear all collections and maps
      this.clearGhostIcons()
      this.desktopCorruption.iconOffsets.clear()
      this.desktopCorruption.iconCorruptionFilters.clear()
      
      // Clear icon move time tracking
      if (this.desktopCorruption.iconLastMoveTime) {
        this.desktopCorruption.iconLastMoveTime.clear()
      }
      
      // Clear notification queue
      this.phantomNotifications.queue = []
      
      // Clear terminal windows
      this.terminalPopups.activeWindows = []
      
      // Clear disk space warnings
      this.diskSpaceWarnings.activeWarnings = []
      
      // Restore wallpaper
      this.restoreWallpaper()
      
      console.log('[VisualCorruption] Cleaned up all visual corruption effects and freed memory')
    }
  }
})
