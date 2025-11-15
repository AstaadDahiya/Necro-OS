<template>
  <div class="taskbar">
    <!-- Start button -->
    <button 
      class="start-button"
      @click="toggleStartMenu"
    >
      <span class="start-icon">🪟</span>
      <span class="start-text">Start</span>
    </button>

    <!-- Minimized window buttons -->
    <div class="taskbar-windows">
      <button
        v-for="window in minimizedWindows"
        :key="window.id"
        class="taskbar-window-button"
        @click="restoreWindow(window.id)"
      >
        {{ window.title }}
      </button>
    </div>

    <!-- System tray with clock -->
    <div class="system-tray">
      <!-- Seasonal event indicator -->
      <div 
        v-if="seasonalEvent" 
        class="seasonal-indicator"
        :title="seasonalEvent.description"
      >
        {{ seasonalEvent.icon }}
      </div>
      <div class="clock">{{ currentTime }}</div>
    </div>

    <!-- Start Menu (will be implemented in next task) -->
    <StartMenu 
      v-if="startMenuOpen"
      @close="startMenuOpen = false"
      @launch-app="handleLaunchApp"
      @shutdown="handleShutdown"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWindowManagerStore } from '../stores/windowManager'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'
import { audioService } from '../utils/audioService'
import { shouldRunBackwards, getBackwardsDuration, shouldShow333AM } from '../utils/possessedAppsService'
import StartMenu from './StartMenu.vue'

const windowManager = useWindowManagerStore()
const advancedHaunting = useAdvancedHauntingStore()

// Start menu state
const startMenuOpen = ref(false)

// Clock state
const currentTime = ref('')
let clockInterval = null
let backwardsTimeout = null
let isRunningBackwards = ref(false)
let backwardsEndTime = null

// Seasonal event state
const seasonalEvent = ref(null)

// Get minimized windows from store
const minimizedWindows = computed(() => {
  return windowManager.minimizedWindows
})

// Toggle start menu
function toggleStartMenu() {
  startMenuOpen.value = !startMenuOpen.value
  
  // Play menu sound when opening
  if (startMenuOpen.value) {
    audioService.play('menu')
  }
}

// Restore minimized window
function restoreWindow(windowId) {
  windowManager.restoreWindow(windowId)
}

// Handle app launch from start menu
function handleLaunchApp(appName) {
  startMenuOpen.value = false
  // The StartMenu component will handle the actual launch
}

// Handle shutdown - trigger BSOD
function handleShutdown() {
  startMenuOpen.value = false
  // Dispatch event for Desktop to trigger BSOD
  window.dispatchEvent(new CustomEvent('shutdown-triggered'))
}

// Update clock display
function updateClock() {
  const now = new Date()
  
  // Update seasonal event indicator
  updateSeasonalEvent()
  
  // Check if we should show 3:33 AM
  if (shouldShow333AM(now)) {
    currentTime.value = '3:33 AM'
    return
  }
  
  // Check if we should run backwards
  const possessionLevel = advancedHaunting.possessionLevel
  if (shouldRunBackwards(possessionLevel) && !isRunningBackwards.value) {
    startBackwardsClock()
  }
  
  // If running backwards, decrement time
  if (isRunningBackwards.value) {
    if (Date.now() >= backwardsEndTime) {
      stopBackwardsClock()
    } else {
      // Subtract 1 second from displayed time
      const displayTime = new Date(now.getTime() - 2000) // Go back 2 seconds to make it noticeable
      formatTime(displayTime)
      return
    }
  }
  
  formatTime(now)
}

// Update seasonal event indicator
function updateSeasonalEvent() {
  const event = advancedHaunting.getCurrentSeasonalEvent()
  seasonalEvent.value = event
}

// Format time for display
function formatTime(date) {
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  
  hours = hours % 12
  hours = hours ? hours : 12 // 0 should be 12
  
  const minutesStr = minutes < 10 ? '0' + minutes : minutes
  currentTime.value = `${hours}:${minutesStr} ${ampm}`
}

// Start backwards clock behavior
function startBackwardsClock() {
  isRunningBackwards.value = true
  const duration = getBackwardsDuration() * 1000 // Convert to milliseconds
  backwardsEndTime = Date.now() + duration
  
  // Schedule return to normal
  backwardsTimeout = setTimeout(() => {
    stopBackwardsClock()
  }, duration)
}

// Stop backwards clock behavior
function stopBackwardsClock() {
  isRunningBackwards.value = false
  backwardsEndTime = null
  if (backwardsTimeout) {
    clearTimeout(backwardsTimeout)
    backwardsTimeout = null
  }
}

// Initialize clock
onMounted(() => {
  updateClock()
  clockInterval = setInterval(updateClock, 1000)
})

// Cleanup clock interval
onUnmounted(() => {
  if (clockInterval) {
    clearInterval(clockInterval)
  }
  if (backwardsTimeout) {
    clearTimeout(backwardsTimeout)
  }
})
</script>

<style scoped>
.taskbar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  display: flex;
  align-items: center;
  padding: 2px;
  gap: 2px;
  z-index: 9999;
}

.start-button {
  height: 32px;
  padding: 0 8px;
  cursor: pointer;
  font-weight: bold;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.start-icon {
  font-size: 16px;
}

.start-text {
  font-family: 'MS Sans Serif', sans-serif;
}

.taskbar-windows {
  flex: 1;
  display: flex;
  gap: 2px;
  overflow-x: auto;
  overflow-y: hidden;
}

.taskbar-window-button {
  height: 32px;
  padding: 0 12px;
  cursor: pointer;
  font-size: 11px;
  white-space: nowrap;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.system-tray {
  height: 32px;
  padding: 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.seasonal-indicator {
  font-size: 16px;
  cursor: help;
  animation: seasonalPulse 2s ease-in-out infinite;
  filter: drop-shadow(0 0 3px rgba(255, 255, 0, 0.5));
}

@keyframes seasonalPulse {
  0%, 100% {
    transform: scale(1);
    filter: drop-shadow(0 0 3px rgba(255, 255, 0, 0.5));
  }
  50% {
    transform: scale(1.1);
    filter: drop-shadow(0 0 6px rgba(255, 255, 0, 0.8));
  }
}

.clock {
  font-size: 11px;
  font-family: 'MS Sans Serif', sans-serif;
  min-width: 60px;
  text-align: center;
}
</style>
