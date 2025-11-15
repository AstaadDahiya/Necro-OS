<template>
  <div 
    v-if="visualCorruption.cursorCorruption.enabled && !reduceMotion"
    class="cursor-corruption"
  >
    <!-- Custom cursor element -->
    <div 
      ref="cursorElement"
      class="custom-cursor"
      :class="{ 'cursor-glitch': isGlitching }"
      :style="cursorStyle"
    ></div>
    
    <!-- Ghost cursor trails -->
    <div 
      v-for="trail in ghostTrails" 
      :key="trail.id"
      class="cursor-trail"
      :style="{
        left: trail.x + 'px',
        top: trail.y + 'px',
        opacity: trail.opacity
      }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useVisualCorruptionStore } from '../stores/visualCorruption'

const visualCorruption = useVisualCorruptionStore()

// Accessibility preferences from localStorage
const reduceMotion = ref(false)

// Cursor state
const cursorX = ref(0)
const cursorY = ref(0)
const cursorRotation = ref(0)
const isGlitching = ref(false)
const ghostTrails = ref([])
const cursorElement = ref(null)

// Autonomous movement state
const isAutonomous = ref(false)
const autonomousAngle = ref(0)
const autonomousRadius = ref(100)
const autonomousCenterX = ref(0)
const autonomousCenterY = ref(0)
const lastUserInteraction = ref(Date.now())

// Intervals and timers
let trailInterval = null
let glitchInterval = null
let teleportInterval = null
let idleCheckInterval = null
let autonomousAnimationFrame = null

// Throttle helper for cursor updates (60fps = 16ms)
let lastCursorUpdate = 0
const CURSOR_THROTTLE_MS = 16

// Computed cursor style
const cursorStyle = computed(() => {
  return {
    transform: `translate(${cursorX.value}px, ${cursorY.value}px) rotate(${cursorRotation.value}deg)`,
    transition: isAutonomous.value ? 'none' : 'transform 0.05s ease-out'
  }
})

// Update cursor position from mouse movement (throttled to 60fps)
function updateCursorPosition(e) {
  const now = Date.now()
  
  // Throttle to 60fps (16ms)
  if (now - lastCursorUpdate < CURSOR_THROTTLE_MS) {
    return
  }
  
  lastCursorUpdate = now
  
  if (isAutonomous.value) {
    stopAutonomousMovement()
  }
  
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  lastUserInteraction.value = Date.now()
}

/**
 * Start the ghost cursor trail effect
 * 
 * This creates a supernatural trailing effect where semi-transparent cursor copies
 * follow behind the real cursor, creating an eerie "ghost" appearance.
 * 
 * Implementation details:
 * - Uses requestAnimationFrame for optimal performance (synced with browser repaint)
 * - Creates trail elements every 50ms at the current cursor position
 * - Each trail fades out over 200ms using CSS opacity transitions
 * - Trails are automatically cleaned up after fade completes
 * - Limited to max 20 trails to prevent memory leaks
 * 
 * Performance optimization:
 * - requestAnimationFrame ensures trails are created in sync with 60fps refresh
 * - Throttled to 50ms intervals (20 trails per second) to avoid excessive DOM updates
 * - Old trails are removed from array to prevent unbounded memory growth
 * 
 * Visual effect:
 * - Creates the illusion of cursor "echoes" following the movement
 * - Trails appear at 50% opacity and fade to 0% over 200ms
 * - CSS transitions handle the smooth fade animation
 */
function startGhostTrail() {
  if (trailInterval) {
    cancelAnimationFrame(trailInterval)
  }
  
  let lastTrailTime = 0
  const TRAIL_INTERVAL = 50 // 50ms between trails (20 trails per second)
  
  function createTrail(timestamp) {
    // Check if trail effect is still enabled
    if (!visualCorruption.cursorCorruption.trailEnabled) {
      trailInterval = requestAnimationFrame(createTrail)
      return
    }
    
    // Throttle trail creation to every 50ms
    // This prevents excessive DOM updates while maintaining smooth visual effect
    if (timestamp - lastTrailTime >= TRAIL_INTERVAL) {
      lastTrailTime = timestamp
      
      // Create new trail element at current cursor position
      const trail = {
        id: `trail-${Date.now()}-${Math.random()}`, // Unique ID for Vue key
        x: cursorX.value,
        y: cursorY.value,
        opacity: 0.5 // Start at 50% opacity
      }
      
      ghostTrails.value.push(trail)
      
      // Schedule trail removal after fade animation completes (200ms)
      // This prevents memory leaks from accumulating trail elements
      setTimeout(() => {
        const index = ghostTrails.value.findIndex(t => t.id === trail.id)
        if (index !== -1) {
          ghostTrails.value.splice(index, 1)
        }
      }, 200)
      
      // Safety limit: Remove oldest trails if we exceed 20 total
      // This prevents memory issues during extended use
      if (ghostTrails.value.length > 20) {
        ghostTrails.value.shift()
      }
    }
    
    // Continue animation loop using requestAnimationFrame
    // This syncs with browser repaint cycle for optimal performance
    trailInterval = requestAnimationFrame(createTrail)
  }
  
  // Start the animation loop
  trailInterval = requestAnimationFrame(createTrail)
}

// Stop ghost trail effect
function stopGhostTrail() {
  if (trailInterval) {
    cancelAnimationFrame(trailInterval)
    trailInterval = null
  }
  ghostTrails.value = []
}

// Glitch cursor effect
function glitchCursor() {
  isGlitching.value = true
  
  setTimeout(() => {
    isGlitching.value = false
  }, 100)
}

// Start glitch interval
function startGlitchEffect() {
  if (glitchInterval) {
    clearInterval(glitchInterval)
  }
  
  const frequency = visualCorruption.cursorCorruption.glitchFrequency
  if (frequency > 0) {
    glitchInterval = setInterval(() => {
      glitchCursor()
    }, frequency)
  }
}

// Stop glitch effect
function stopGlitchEffect() {
  if (glitchInterval) {
    clearInterval(glitchInterval)
    glitchInterval = null
  }
  isGlitching.value = false
}

// Teleport cursor to random position
function teleportCursor() {
  if (!visualCorruption.cursorCorruption.teleportEnabled) {
    return
  }
  
  // Calculate random offset (50-100 pixels)
  const distance = Math.random() * 50 + 50
  const angle = Math.random() * Math.PI * 2
  
  const offsetX = Math.cos(angle) * distance
  const offsetY = Math.sin(angle) * distance
  
  // Update cursor position
  cursorX.value = Math.max(0, Math.min(window.innerWidth, cursorX.value + offsetX))
  cursorY.value = Math.max(0, Math.min(window.innerHeight, cursorY.value + offsetY))
}

// Start random teleportation
function startTeleportEffect() {
  if (teleportInterval) {
    clearInterval(teleportInterval)
  }
  
  if (visualCorruption.cursorCorruption.teleportEnabled) {
    // Teleport randomly every 10-20 seconds
    const scheduleNextTeleport = () => {
      const delay = Math.random() * 10000 + 10000
      teleportInterval = setTimeout(() => {
        teleportCursor()
        scheduleNextTeleport()
      }, delay)
    }
    
    scheduleNextTeleport()
  }
}

// Stop teleportation
function stopTeleportEffect() {
  if (teleportInterval) {
    clearTimeout(teleportInterval)
    teleportInterval = null
  }
}

// Autonomous cursor movement
function autonomousMovement() {
  if (!isAutonomous.value) {
    return
  }
  
  // Circular motion
  autonomousAngle.value += 0.02
  
  const x = autonomousCenterX.value + Math.cos(autonomousAngle.value) * autonomousRadius.value
  const y = autonomousCenterY.value + Math.sin(autonomousAngle.value) * autonomousRadius.value
  
  cursorX.value = x
  cursorY.value = y
  
  autonomousAnimationFrame = requestAnimationFrame(autonomousMovement)
}

// Start autonomous movement
function startAutonomousMovement() {
  if (isAutonomous.value) {
    return
  }
  
  isAutonomous.value = true
  autonomousCenterX.value = cursorX.value
  autonomousCenterY.value = cursorY.value
  autonomousAngle.value = 0
  
  autonomousMovement()
}

// Stop autonomous movement
function stopAutonomousMovement() {
  if (!isAutonomous.value) {
    return
  }
  
  isAutonomous.value = false
  
  if (autonomousAnimationFrame) {
    cancelAnimationFrame(autonomousAnimationFrame)
    autonomousAnimationFrame = null
  }
}

// Check for idle state
function checkIdleState() {
  const idleTime = Date.now() - lastUserInteraction.value
  
  // Start autonomous movement after 5 seconds of idle
  if (idleTime > 5000 && visualCorruption.cursorCorruption.autonomousEnabled && !isAutonomous.value) {
    startAutonomousMovement()
  }
}

// Watch for cursor corruption settings changes
watch(() => visualCorruption.cursorCorruption.rotation, (newRotation) => {
  cursorRotation.value = newRotation
})

watch(() => visualCorruption.cursorCorruption.trailEnabled, (enabled) => {
  if (enabled) {
    startGhostTrail()
  } else {
    stopGhostTrail()
  }
})

watch(() => visualCorruption.cursorCorruption.glitchFrequency, (frequency) => {
  if (frequency > 0) {
    startGlitchEffect()
  } else {
    stopGlitchEffect()
  }
})

watch(() => visualCorruption.cursorCorruption.teleportEnabled, (enabled) => {
  if (enabled) {
    startTeleportEffect()
  } else {
    stopTeleportEffect()
  }
})

watch(() => visualCorruption.cursorCorruption.autonomousEnabled, (enabled) => {
  if (!enabled && isAutonomous.value) {
    stopAutonomousMovement()
  }
})

watch(() => visualCorruption.cursorCorruption.enabled, (enabled) => {
  if (enabled) {
    document.body.style.cursor = 'none'
  } else {
    document.body.style.cursor = 'auto'
  }
})

// Setup and cleanup
onMounted(() => {
  // Load accessibility preferences
  reduceMotion.value = localStorage.getItem('necro-os-reduce-motion') === 'true'
  
  if (reduceMotion.value) {
    console.log('[CursorCorruption] Reduced motion enabled - disabling cursor effects')
    return // Skip all cursor corruption effects
  }
  
  // Only hide default cursor if corruption is enabled
  if (visualCorruption.cursorCorruption.enabled) {
    document.body.style.cursor = 'none'
  }
  
  // Add mouse move listener
  document.addEventListener('mousemove', updateCursorPosition)
  
  // Initialize cursor position
  cursorX.value = window.innerWidth / 2
  cursorY.value = window.innerHeight / 2
  
  // Start idle check interval
  idleCheckInterval = setInterval(checkIdleState, 1000)
  
  // Initialize effects based on current settings
  if (visualCorruption.cursorCorruption.trailEnabled) {
    startGhostTrail()
  }
  
  if (visualCorruption.cursorCorruption.glitchFrequency > 0) {
    startGlitchEffect()
  }
  
  if (visualCorruption.cursorCorruption.teleportEnabled) {
    startTeleportEffect()
  }
})

onUnmounted(() => {
  // Restore default cursor
  document.body.style.cursor = 'auto'
  
  // Remove event listener
  document.removeEventListener('mousemove', updateCursorPosition)
  
  // Clear all intervals and timers
  stopGhostTrail()
  stopGlitchEffect()
  stopTeleportEffect()
  stopAutonomousMovement()
  
  if (idleCheckInterval) {
    clearInterval(idleCheckInterval)
    idleCheckInterval = null
  }
  
  // Clear all ghost trails
  ghostTrails.value = []
  
  console.log('[CursorCorruption] Cleaned up all event listeners and timers')
})
</script>

<style scoped>
.cursor-corruption {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10001;
}

.custom-cursor {
  position: fixed;
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="white" stroke="black" stroke-width="1" d="M0,0 L0,16 L4,12 L7,19 L9,18 L6,11 L11,11 Z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10001;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.custom-cursor.cursor-glitch {
  filter: hue-rotate(180deg) invert(1);
  animation: glitch-shake 0.1s infinite;
}

@keyframes glitch-shake {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-2px, 2px); }
  50% { transform: translate(2px, -2px); }
  75% { transform: translate(-2px, -2px); }
}

.cursor-trail {
  position: fixed;
  width: 20px;
  height: 20px;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="white" stroke="black" stroke-width="1" d="M0,0 L0,16 L4,12 L7,19 L9,18 L6,11 L11,11 Z"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 10000;
  animation: trail-fade 0.2s ease-out forwards;
  will-change: opacity, transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

@keyframes trail-fade {
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>
