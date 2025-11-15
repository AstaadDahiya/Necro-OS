import { useWindowManagerStore } from '../stores/windowManager'
import { useGhostBehaviorStore } from '../stores/ghostBehavior'

/**
 * Detect if user is idle based on the current haunting level timeout
 */
export function detectIdle(callback) {
  const ghostStore = useGhostBehaviorStore()
  
  // Start idle detection with current timeout
  ghostStore.startIdleDetection()
  
  // Set up interval to check if haunting should trigger
  const checkInterval = setInterval(() => {
    if (ghostStore.isHaunting) {
      callback()
      ghostStore.resetIdleTimer()
    }
  }, 1000)
  
  return () => {
    clearInterval(checkInterval)
    ghostStore.stopIdleDetection()
  }
}

/**
 * Select a random ghost action based on current haunting level
 */
export function selectRandomAction(hauntingLevel) {
  const actions = ['cursor', 'shake', 'glitch', 'open', 'type']
  
  // At level 3+, add window spam to possible actions
  if (hauntingLevel >= 3) {
    actions.push('spam')
  }
  
  // At level 4+, add jumpscare to possible actions
  if (hauntingLevel >= 4) {
    actions.push('jumpscare')
  }
  
  // Weight actions based on haunting level
  const weights = {
    cursor: hauntingLevel >= 2 ? 2 : 1,
    shake: hauntingLevel >= 1 ? 3 : 2,
    glitch: hauntingLevel >= 3 ? 5 : 2, // Increased from 2 to 5
    open: hauntingLevel >= 2 ? 2 : 1,
    type: hauntingLevel >= 1 ? 2 : 1,
    spam: hauntingLevel >= 5 ? 3 : 1,
    jumpscare: hauntingLevel >= 5 ? 3 : 2 // 50% increase at level 5
  }
  
  // Create weighted array
  const weightedActions = []
  actions.forEach(action => {
    for (let i = 0; i < weights[action]; i++) {
      weightedActions.push(action)
    }
  })
  
  return weightedActions[Math.floor(Math.random() * weightedActions.length)]
}

// Global throttle for ghost actions - minimum 2 seconds between actions
let lastActionTime = 0
const ACTION_THROTTLE = 2000 // 2 seconds (reduced from 5)

/**
 * Execute a ghost action with throttling
 */
export function executeGhostAction(actionType, intensity = 1) {
  const now = Date.now()
  
  // Throttle actions to one per 5 seconds
  if (now - lastActionTime < ACTION_THROTTLE) {
    return
  }
  
  lastActionTime = now
  
  try {
    switch (actionType) {
      case 'cursor':
        moveCursor(intensity)
        break
      case 'shake':
        shakeWindow(intensity)
        break
      case 'glitch':
        screenGlitch(intensity)
        break
      case 'open':
        spontaneousOpen(intensity)
        break
      case 'type':
        ghostType(intensity)
        break
      case 'spam':
        windowSpam(intensity)
        break
      case 'jumpscare':
        executeJumpscare(intensity)
        break
      default:
        console.warn(`Unknown ghost action: ${actionType}`)
    }
  } catch (error) {
    console.error('Ghost action failed:', error)
  }
}

/**
 * Move the cursor autonomously
 */
export function moveCursor(intensity) {
  const cursor = document.createElement('div')
  cursor.style.position = 'fixed'
  cursor.style.width = '20px'
  cursor.style.height = '20px'
  cursor.style.background = 'rgba(255, 0, 0, 0.5)'
  cursor.style.borderRadius = '50%'
  cursor.style.pointerEvents = 'none'
  cursor.style.zIndex = '99999'
  cursor.style.transition = 'all 0.5s ease'
  
  document.body.appendChild(cursor)
  
  const moveCount = intensity * 3
  let moves = 0
  
  const moveInterval = setInterval(() => {
    const x = Math.random() * window.innerWidth
    const y = Math.random() * window.innerHeight
    
    cursor.style.left = `${x}px`
    cursor.style.top = `${y}px`
    
    moves++
    if (moves >= moveCount) {
      clearInterval(moveInterval)
      setTimeout(() => {
        cursor.remove()
      }, 500)
    }
  }, 500)
}

/**
 * Shake a random window
 */
export function shakeWindow(intensity) {
  const windowStore = useWindowManagerStore()
  const windows = windowStore.openWindows
  
  if (windows.length === 0) return
  
  const randomWindow = windows[Math.floor(Math.random() * windows.length)]
  const windowElement = document.querySelector(`[data-window-id="${randomWindow.id}"]`)
  
  if (!windowElement) return
  
  const shakeIntensity = intensity * 5
  const duration = intensity * 200
  
  windowElement.style.animation = `shake ${duration}ms ease-in-out`
  windowElement.style.setProperty('--shake-intensity', `${shakeIntensity}px`)
  
  setTimeout(() => {
    windowElement.style.animation = ''
  }, duration)
}

/**
 * Apply screen glitch effect
 */
export function screenGlitch(intensity) {
  const glitch = document.createElement('div')
  glitch.style.position = 'fixed'
  glitch.style.top = '0'
  glitch.style.left = '0'
  glitch.style.width = '100%'
  glitch.style.height = '100%'
  glitch.style.pointerEvents = 'none'
  glitch.style.zIndex = '99998'
  glitch.style.mixBlendMode = 'difference'
  
  document.body.appendChild(glitch)
  
  const glitchCount = intensity * 8 // Increased from 5
  let glitches = 0
  
  const glitchInterval = setInterval(() => {
    // Alternate between red, green, and inverted colors
    const colors = [
      'rgba(255, 0, 0, 0.3)',
      'rgba(0, 255, 0, 0.2)',
      'rgba(0, 0, 255, 0.2)',
      'rgba(255, 255, 255, 0.4)'
    ]
    glitch.style.background = colors[Math.floor(Math.random() * colors.length)]
    glitch.style.opacity = Math.random() * 0.8 + 0.2
    glitch.style.transform = `translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px) scale(${0.98 + Math.random() * 0.04})`
    
    // Add screen distortion
    if (Math.random() < 0.3) {
      document.body.style.filter = `hue-rotate(${Math.random() * 360}deg) contrast(${100 + Math.random() * 50}%)`
    }
    
    glitches++
    if (glitches >= glitchCount) {
      clearInterval(glitchInterval)
      glitch.remove()
      document.body.style.filter = '' // Reset filter
    }
  }, 40) // Faster glitching
}

/**
 * Spontaneously open a random application
 */
export function spontaneousOpen(intensity) {
  const windowStore = useWindowManagerStore()
  const apps = ['notepad', 'paint', 'ie', 'mycomputer', 'minesweeper']
  
  // Open 1-2 windows based on intensity
  const count = intensity >= 3 ? 2 : 1
  
  for (let i = 0; i < count; i++) {
    const randomApp = apps[Math.floor(Math.random() * apps.length)]
    
    setTimeout(() => {
      windowStore.openWindow(randomApp)
    }, i * 500)
  }
}

/**
 * Type ghost text in Notepad
 */
export function ghostType(intensity) {
  const windowStore = useWindowManagerStore()
  
  // Find an open Notepad window
  const notepadWindow = windowStore.openWindows.find(w => w.appName === 'notepad')
  
  if (!notepadWindow) {
    // Open Notepad if none exists
    windowStore.openWindow('notepad')
    return
  }
  
  const messages = [
    'I am watching you...',
    'You cannot escape...',
    'This is my domain now...',
    'Why do you resist?',
    'The haunting has only begun...',
    'Your files are mine...',
    'I live in your computer...',
    'Delete me if you dare...',
    'I see everything you type...',
    'The cursor obeys me now...'
  ]
  
  const message = messages[Math.floor(Math.random() * messages.length)]
  
  // Dispatch custom event to trigger typing in Notepad
  window.dispatchEvent(new CustomEvent('ghost-type', {
    detail: {
      windowId: notepadWindow.id,
      text: message,
      speed: Math.max(50, 200 - intensity * 30)
    }
  }))
}

// Cooldown tracking for window spam
let lastSpamTime = 0
const SPAM_COOLDOWN = 30000 // 30 seconds cooldown

/**
 * Spam multiple windows at once (level 5+)
 */
export function windowSpam(intensity) {
  const now = Date.now()
  
  // Check cooldown
  if (now - lastSpamTime < SPAM_COOLDOWN) {
    console.log('Window spam on cooldown')
    return
  }
  
  lastSpamTime = now
  
  const windowStore = useWindowManagerStore()
  const apps = ['notepad', 'paint', 'ie', 'mycomputer', 'minesweeper', 'recyclebin']
  
  const spamCount = Math.min(5, intensity)
  
  for (let i = 0; i < spamCount; i++) {
    const randomApp = apps[Math.floor(Math.random() * apps.length)]
    
    setTimeout(() => {
      windowStore.openWindow(randomApp)
    }, i * 200)
  }
}

/**
 * Initialize the haunting system with escalation
 */
export function initializeHaunting() {
  const ghostStore = useGhostBehaviorStore()
  
  // Start escalation timer (increments level every 60 seconds)
  ghostStore.startEscalation()
  
  // Start idle detection
  ghostStore.startIdleDetection()
  
  // Main haunting loop - executes actions based on frequency
  let loopLastActionTime = Date.now()
  
  const hauntingLoop = setInterval(() => {
    const now = Date.now()
    const timeSinceLastAction = now - loopLastActionTime
    
    // Check if enough time has passed based on current action frequency
    if (timeSinceLastAction >= ghostStore.currentActionFrequency) {
      // Only execute if haunting is active (user is idle)
      if (ghostStore.isHaunting) {
        const action = selectRandomAction(ghostStore.hauntingLevel)
        executeGhostAction(action, ghostStore.hauntingLevel)
        loopLastActionTime = now
      }
    }
  }, 1000) // Check every second
  
  // Return cleanup function
  return () => {
    clearInterval(hauntingLoop)
    ghostStore.cleanup()
  }
}

/**
 * Trigger a jumpscare based on intensity
 */
export function executeJumpscare(intensity) {
  // Dispatch custom event to trigger jumpscare
  window.dispatchEvent(new CustomEvent('ghost-jumpscare', {
    detail: {
      intensity: intensity
    }
  }))
}

/**
 * Reset user activity (call this on any user interaction)
 */
export function resetUserActivity() {
  const ghostStore = useGhostBehaviorStore()
  ghostStore.resetIdleTimer()
}
