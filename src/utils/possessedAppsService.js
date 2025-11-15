/**
 * Possessed Apps Service
 * 
 * Manages haunting behaviors for applications based on possession level.
 * Integrates with advancedHauntingStore to provide app-specific possession effects.
 */

// Import store for feature checks
let advancedHauntingStore = null

/**
 * Initialize the service with the store
 * @param {Object} store - The advanced haunting store instance
 */
export function initializePossessedAppsService(store) {
  advancedHauntingStore = store
}

/**
 * Check if possessed apps feature is enabled
 * @returns {boolean}
 */
function isFeatureEnabled() {
  if (!advancedHauntingStore) {
    return true // Default to enabled if store not initialized
  }
  return advancedHauntingStore.isFeatureEnabled('possessedApps')
}

// ============================================
// Calculator Possession
// ============================================

/**
 * Get calculator result with potential possession interference
 * @param {string} operation - The operation being performed
 * @param {number} actualResult - The correct calculation result
 * @param {number} possessionLevel - Current possession level (0-100)
 * @returns {number|string} - Either the correct result, incorrect result, or demonic symbol
 */
export function getCalculatorResult(operation, actualResult, possessionLevel) {
  // Check if feature is enabled
  if (!isFeatureEnabled()) {
    return actualResult
  }
  
  // Above possession level 60, show demonic symbols instead
  if (possessionLevel > 60 && shouldShowDemonicSymbol()) {
    return getDemonicSymbol()
  }
  
  // Above possession level 20, return incorrect results 30% of the time
  if (possessionLevel > 20 && Math.random() < 0.3) {
    return getIncorrectResult(actualResult)
  }
  
  return actualResult
}

/**
 * Check if demonic symbol should be shown (random chance)
 * @returns {boolean}
 */
export function shouldShowDemonicSymbol() {
  return Math.random() < 0.4 // 40% chance when possession > 60
}

/**
 * Get a random demonic symbol
 * @returns {string}
 */
export function getDemonicSymbol() {
  const symbols = ['⛧', '☠', '👁', '🕯', '⚰']
  return symbols[Math.floor(Math.random() * symbols.length)]
}

/**
 * Generate an incorrect result based on the actual result
 * @param {number} actualResult - The correct result
 * @returns {number}
 */
function getIncorrectResult(actualResult) {
  // Generate a plausibly wrong result
  const variations = [
    actualResult + Math.floor(Math.random() * 10) + 1,
    actualResult - Math.floor(Math.random() * 10) - 1,
    actualResult * 2,
    actualResult / 2,
    actualResult + 666,
    actualResult - 666,
    Math.floor(actualResult * 1.1),
    Math.floor(actualResult * 0.9)
  ]
  
  // Filter out the actual result and pick a random variation
  const wrongResults = variations.filter(v => v !== actualResult)
  return wrongResults[Math.floor(Math.random() * wrongResults.length)]
}

// ============================================
// Clock Possession
// ============================================

/**
 * Check if clock should run backwards
 * @param {number} possessionLevel - Current possession level (0-100)
 * @returns {boolean}
 */
export function shouldRunBackwards(possessionLevel) {
  if (!isFeatureEnabled()) {
    return false
  }
  return possessionLevel > 30
}

/**
 * Get duration for backwards clock behavior (in seconds)
 * @returns {number} - Duration between 10 and 30 seconds
 */
export function getBackwardsDuration() {
  return Math.floor(Math.random() * 21) + 10 // 10-30 seconds
}

/**
 * Check if clock should show 3:33 AM
 * @param {Date} currentTime - Current time
 * @returns {boolean}
 */
export function shouldShow333AM(currentTime) {
  if (!isFeatureEnabled()) {
    return false
  }
  const hours = currentTime.getHours()
  const minutes = currentTime.getMinutes()
  
  // Between 3:32 and 3:34 AM
  return hours === 3 && minutes >= 32 && minutes <= 34
}

// ============================================
// Task Manager Possession
// ============================================

const CURSED_PROCESS_NAMES = [
  'soul.exe',
  'haunt.dll',
  'possession.sys',
  'void.exe',
  'reaper.dll',
  'curse.exe',
  'phantom.sys'
]

/**
 * Get list of cursed processes to inject into Task Manager
 * @param {number} possessionLevel - Current possession level (0-100)
 * @returns {Array} - Array of cursed process objects
 */
export function getCursedProcesses(possessionLevel) {
  if (!isFeatureEnabled()) {
    return []
  }
  
  // Number of cursed processes increases with possession level
  const count = Math.min(Math.floor(possessionLevel / 20) + 2, 5) // 2-5 processes
  
  const processes = []
  const usedNames = new Set()
  
  for (let i = 0; i < count; i++) {
    const process = generateCursedProcess(usedNames)
    if (process) {
      processes.push(process)
      usedNames.add(process.name)
    }
  }
  
  return processes
}

/**
 * Generate a single cursed process
 * @param {Set} usedNames - Set of already used process names
 * @returns {Object|null} - Cursed process object or null if no names available
 */
export function generateCursedProcess(usedNames = new Set()) {
  // Get available names
  const availableNames = CURSED_PROCESS_NAMES.filter(name => !usedNames.has(name))
  
  if (availableNames.length === 0) {
    return null
  }
  
  const name = availableNames[Math.floor(Math.random() * availableNames.length)]
  
  return {
    name,
    pid: Math.floor(Math.random() * 9000) + 1000, // Random PID 1000-9999
    cpu: Math.floor(Math.random() * 30) + 5, // 5-35% CPU
    memory: Math.floor(Math.random() * 200) + 50, // 50-250 MB
    status: 'Running',
    cursed: true
  }
}

// ============================================
// Command Prompt Possession
// ============================================

const AUTONOMOUS_MESSAGES = [
  'I am here',
  'You cannot escape',
  'The void watches',
  'Your soul is mine',
  'They are coming',
  'Do you hear them?',
  'The darkness grows',
  'You should not have opened this',
  'There is no escape',
  'We are legion'
]

/**
 * Check if command prompt should type autonomously
 * @param {number} possessionLevel - Current possession level (0-100)
 * @returns {boolean}
 */
export function shouldTypeAutonomously(possessionLevel) {
  if (!isFeatureEnabled()) {
    return false
  }
  return possessionLevel > 40
}

/**
 * Get a random autonomous message
 * @returns {string}
 */
export function getAutonomousMessage() {
  return AUTONOMOUS_MESSAGES[Math.floor(Math.random() * AUTONOMOUS_MESSAGES.length)]
}

/**
 * Type a message character by character with delays
 * @param {string} message - Message to type
 * @param {Function} onCharacter - Callback for each character typed
 * @param {Function} onComplete - Callback when typing is complete
 * @returns {Function} - Cleanup function to stop typing
 */
export function typeMessage(message, onCharacter, onComplete) {
  let currentIndex = 0
  let timeoutId = null
  let cancelled = false
  
  function typeNextCharacter() {
    if (cancelled || currentIndex >= message.length) {
      if (!cancelled && onComplete) {
        onComplete()
      }
      return
    }
    
    const char = message[currentIndex]
    onCharacter(char)
    currentIndex++
    
    // Random delay between 50-150ms per character
    const delay = Math.floor(Math.random() * 101) + 50
    timeoutId = setTimeout(typeNextCharacter, delay)
  }
  
  // Start typing
  typeNextCharacter()
  
  // Return cleanup function
  return () => {
    cancelled = true
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
  }
}
