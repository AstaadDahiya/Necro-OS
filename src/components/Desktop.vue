<template>
  <div 
    class="desktop" 
    @click="handleDesktopClick"
    @contextmenu="handleContextMenu"
    :style="desktopStyle"
  >
    <!-- Desktop icons grid -->
    <div class="desktop-icons">
      <!-- Regular desktop icons -->
      <div 
        v-for="icon in desktopIcons" 
        :key="icon.name"
        class="desktop-icon"
        :style="getIconStyle(icon.app)"
        @dblclick="openApp(icon.app)"
      >
        <div class="icon-image">💾</div>
        <div class="icon-label">{{ icon.name }}</div>
      </div>
      
      <!-- Ghost icons -->
      <div 
        v-for="ghost in visualCorruption.desktopCorruption.ghostIcons" 
        :key="ghost.id"
        class="desktop-icon ghost-icon"
        :class="{ 'fading-out': ghost.fadingOut }"
        :style="getGhostIconStyle(ghost)"
      >
        <div class="icon-image">💾</div>
        <div class="icon-label">{{ ghost.name }}</div>
      </div>
    </div>

    <!-- Render all open windows (use v-show for minimized to preserve state) -->
    <Window 
      v-for="window in windowManager.openWindows" 
      :key="window.id"
      v-show="!window.isMinimized"
      :window-data="window"
    >
      <component 
        :is="getAppComponent(window.appName)" 
        :window-id="window.id"
        v-if="getAppComponent(window.appName)"
      />
    </Window>

    <!-- Cursed Clippy AI Assistant -->
    <CursedClippy ref="cursedClippyRef" />

    <!-- Taskbar at bottom -->
    <Taskbar />

    <!-- Special event components -->
    <ScaryMaze ref="scaryMazeRef" @close="handleScaryMazeClose" />
    <BSOD ref="bsodRef" @close="handleBSODClose" />
    <BootSequence ref="bootSequenceRef" @complete="handleBootComplete" />

    <!-- Phantom Notifications - rendered below CRT filter -->
    <PhantomNotifications />
    
    <!-- Disk Space Warnings -->
    <DiskSpaceWarning
      v-for="warning in visualCorruption.activeDiskSpaceWarnings"
      :key="warning.id"
      :warning-id="warning.id"
      :offset="warning.offset"
      @close-attempt="handleDiskWarningCloseAttempt"
      @ok-attempt="handleDiskWarningOkAttempt"
    />
    
    <!-- CRT Filter overlay - rendered last for proper z-index layering -->
    <CRTFilter />
    
    <!-- Cursor Corruption - rendered above CRT filter -->
    <CursorCorruption />
    
    <!-- Context Menu - rendered above everything -->
    <div 
      v-if="contextMenuVisible"
      class="context-menu"
      :style="contextMenuStyle"
      @click.stop
    >
      <div class="context-menu-item" @click="handleRefresh">
        <span class="menu-icon">🔄</span>
        <span>Refresh</span>
      </div>
      <div class="context-menu-separator"></div>
      <div class="context-menu-item" @click="handleProperties">
        <span class="menu-icon">📋</span>
        <span>Properties</span>
      </div>
    </div>
    
    <!-- Debug UI - Possession Level Display (Ctrl+Shift+D to toggle) -->
    <div v-if="showDebugUI" class="debug-ui">
      <div class="debug-panel">
        <div class="debug-title">🔧 Debug Info</div>
        <div class="debug-item">
          <span class="debug-label">Possession Level:</span>
          <span class="debug-value">{{ advancedHaunting.possessionLevel.toFixed(1) }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Haunting Level:</span>
          <span class="debug-value">{{ ghostBehavior.hauntingLevel }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Difficulty:</span>
          <span class="debug-value">{{ advancedHaunting.difficulty }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Session Time:</span>
          <span class="debug-value">{{ formatSessionTime() }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Seasonal Event:</span>
          <span class="debug-value">{{ getSeasonalEventName() }}</span>
        </div>
        <div class="debug-hint">Press Ctrl+Shift+D to hide</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useWindowManagerStore } from '../stores/windowManager'
import { useGhostBehaviorStore } from '../stores/ghostBehavior'
import { useVisualCorruptionStore } from '../stores/visualCorruption'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'
import { getAppComponent } from '../utils/appRegistry'
import Window from './Window.vue'
import Taskbar from './Taskbar.vue'
import CursedClippy from './CursedClippy.vue'
import ScaryMaze from './ScaryMaze.vue'
import BSOD from './BSOD.vue'
import BootSequence from './BootSequence.vue'
import CRTFilter from './CRTFilter.vue'
import CursorCorruption from './CursorCorruption.vue'
import PhantomNotifications from './PhantomNotifications.vue'
import DiskSpaceWarning from './DiskSpaceWarning.vue'

const windowManager = useWindowManagerStore()
const ghostBehavior = useGhostBehaviorStore()
const visualCorruption = useVisualCorruptionStore()
const advancedHaunting = useAdvancedHauntingStore()
const scaryMazeRef = ref(null)
const cursedClippyRef = ref(null)
const bsodRef = ref(null)
const bootSequenceRef = ref(null)

// Debug UI toggle (can be enabled via localStorage)
const showDebugUI = ref(false)

// Context menu state
const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuRotation = ref(0)

// Desktop icons configuration
const desktopIcons = [
  { name: 'My Computer', app: 'mycomputer' },
  { name: 'Recycle Bin', app: 'recyclebin' },
  { name: 'Internet Explorer', app: 'ie' },
  { name: 'Notepad', app: 'notepad' },
  { name: 'Calculator', app: 'calculator' },
  { name: 'Task Manager', app: 'taskmanager' },
  { name: 'Command Prompt', app: 'commandprompt' },
  { name: 'SoulScanner™', app: 'soulscanner' },
  { name: 'Spirit Board', app: 'spiritboard' }
]

// Computed style for desktop background
const desktopStyle = computed(() => {
  const corruption = visualCorruption.desktopCorruption
  const styles = {}
  
  // Apply background darkening
  if (corruption.backgroundDarkness > 0) {
    styles.filter = `brightness(${100 - corruption.backgroundDarkness}%)`
  }
  
  // Apply wallpaper flicker (takes priority over corrupted wallpaper)
  if (corruption.currentFlickerWallpaper) {
    styles.backgroundImage = `url(${corruption.currentFlickerWallpaper})`
    styles.backgroundSize = 'cover'
    styles.backgroundPosition = 'center'
    styles.backgroundRepeat = 'no-repeat'
    // Brief flash effect on flicker
    styles.animation = 'wallpaper-flash 0.1s ease-out'
  }
  // Apply wallpaper replacement (only if not flickering)
  else if (corruption.corruptedWallpaper === 'corrupted') {
    // Create a glitch pattern using CSS
    styles.background = `
      repeating-linear-gradient(
        0deg,
        #008080 0px,
        #006060 2px,
        #004040 4px,
        #008080 6px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255, 0, 0, 0.1) 0px,
        rgba(0, 255, 0, 0.1) 2px,
        rgba(0, 0, 255, 0.1) 4px
      )
    `
    styles.backgroundBlendMode = 'overlay'
  }
  
  // Add smooth transition for wallpaper swap
  styles.transition = 'filter 2s ease-in-out, background 0.05s ease-in-out, background-image 0.05s ease-in-out'
  
  return styles
})

// Get style for individual icon (with offset and corruption filter)
function getIconStyle(iconId) {
  const corruption = visualCorruption.desktopCorruption
  const styles = {}
  
  // Apply icon offset
  const offset = corruption.iconOffsets.get(iconId)
  if (offset) {
    styles.transform = `translate(${offset.x}px, ${offset.y}px)`
  }
  
  // Apply corruption filter
  const filter = corruption.iconCorruptionFilters.get(iconId)
  if (filter) {
    styles.filter = `hue-rotate(${filter.hueRotate}deg) invert(${filter.invert})`
  }
  
  // Add smooth transition
  styles.transition = 'transform 2s ease-in-out, filter 2s ease-in-out'
  
  return styles
}

// Get style for ghost icon
function getGhostIconStyle(ghost) {
  const styles = {
    opacity: ghost.opacity,
    transform: `translate(${ghost.x}px, ${ghost.y}px)`,
    pointerEvents: 'none',
    transition: 'opacity 2s ease-in-out, transform 2s ease-in-out'
  }
  
  return styles
}

// Computed style for context menu
const contextMenuStyle = computed(() => {
  return {
    left: `${contextMenuX.value}px`,
    top: `${contextMenuY.value}px`,
    transform: `rotate(${contextMenuRotation.value}deg)`,
    transition: 'transform 0.2s ease-out'
  }
})

// No longer needed - using v-show instead of v-if for better performance

// Open application when icon is double-clicked
function openApp(appName) {
  const appTitles = {
    mycomputer: 'My Computer',
    recyclebin: 'Recycle Bin',
    ie: 'Internet Explorer',
    notepad: 'Notepad',
    paint: 'Paint',
    minesweeper: 'Minesweeper',
    calculator: 'Calculator',
    taskmanager: 'Task Manager',
    soulscanner: 'SoulScanner™',
    spiritboard: 'Spirit Board'
  }
  
  windowManager.openWindow(appName, {
    title: appTitles[appName] || appName
  })
}

// Reset idle timer when desktop is clicked (for ghost behavior integration)
function handleDesktopClick() {
  ghostBehavior.resetIdleTimer()
  // Hide context menu when clicking elsewhere
  contextMenuVisible.value = false
}

// Handle context menu (right-click)
function handleContextMenu(event) {
  event.preventDefault()
  
  const x = event.clientX
  const y = event.clientY
  
  // Check if context menu should be corrupted
  const corruption = visualCorruption.calculateContextMenuCorruption(
    x, 
    y, 
    ghostBehavior.hauntingLevel
  )
  
  if (corruption) {
    // Apply corruption
    contextMenuX.value = corruption.x
    contextMenuY.value = corruption.y
    contextMenuRotation.value = corruption.rotation
  } else {
    // Normal positioning
    contextMenuX.value = x
    contextMenuY.value = y
    contextMenuRotation.value = 0
  }
  
  contextMenuVisible.value = true
  
  // Reset idle timer
  ghostBehavior.resetIdleTimer()
}

// Context menu actions
function handleRefresh() {
  console.log('Desktop refresh clicked')
  contextMenuVisible.value = false
}

function handleProperties() {
  console.log('Desktop properties clicked')
  contextMenuVisible.value = false
}

// Internet Explorer navigation hook - trigger jumpscare
function handleIENavigate(event) {
  const { url } = event.detail
  // Trigger jumpscare on any navigation (except about:blank)
  if (url && url !== 'about:blank' && scaryMazeRef.value) {
    scaryMazeRef.value.trigger()
  }
}

function handleScaryMazeClose() {
  console.log('ScaryMaze dismissed')
}

function handleBSODClose() {
  console.log('BSOD dismissed')
}

function handleBootComplete() {
  console.log('Boot sequence complete')
}

// Shutdown hook - trigger BSOD
function handleShutdown() {
  if (bsodRef.value) {
    bsodRef.value.trigger()
  }
}

// File delete hook - trigger AI commentary
const deleteCommentaries = [
  "Oh, deleting files now? How... permanent. 💀",
  "That file is gone forever. Just like your sanity.",
  "Deleted! I hope that wasn't important... 😈",
  "Another file bites the dust. I'm keeping count.",
  "You really shouldn't have deleted that...",
  "File deleted. The void thanks you for your contribution.",
  "Gone. Erased. Forgotten. Just like you will be.",
]

function handleFileDeleted(event) {
  const { name } = event.detail
  if (cursedClippyRef.value) {
    const commentary = deleteCommentaries[Math.floor(Math.random() * deleteCommentaries.length)]
    cursedClippyRef.value.showMessage(commentary)
  }
}

function handleFilePermanentlyDeleted(event) {
  const { file } = event.detail
  if (cursedClippyRef.value) {
    const dramaticCommentaries = [
      `"${file.name}" is now lost to the digital abyss. Forever. 💀`,
      `You just permanently deleted "${file.name}". There's no going back now...`,
      `"${file.name}" has been erased from existence. I hope you're happy.`,
      `The file "${file.name}" screamed as it was deleted. Did you hear it?`,
      `"${file.name}" is gone. Completely. Utterly. Eternally gone.`,
    ]
    const commentary = dramaticCommentaries[Math.floor(Math.random() * dramaticCommentaries.length)]
    cursedClippyRef.value.showMessage(commentary)
  }
}

function handleRecycleBinEmptied() {
  if (cursedClippyRef.value) {
    cursedClippyRef.value.showMessage("You emptied the recycle bin. All those files... gone forever. The void grows stronger. 🗑️💀")
  }
}

// Ghost jumpscare hook - trigger jumpscare from ghost behavior
function handleGhostJumpscare(event) {
  const { intensity } = event.detail
  if (scaryMazeRef.value) {
    scaryMazeRef.value.trigger()
  }
}

// Disk space warning handlers
function handleDiskWarningCloseAttempt(warningId) {
  console.log(`Disk warning ${warningId} close attempt - refusing to close`)
  // Warning will shake and refuse to close (handled in component)
}

function handleDiskWarningOkAttempt(warningId) {
  console.log(`Disk warning ${warningId} OK clicked - will reappear`)
  // Warning will temporarily hide and reappear (handled in component)
}

// Close context menu when clicking anywhere
function handleGlobalClick() {
  contextMenuVisible.value = false
}

// Debug UI helper functions
function formatSessionTime() {
  if (!advancedHaunting.sessionStartTime) return '0:00'
  
  const elapsed = Date.now() - advancedHaunting.sessionStartTime
  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getSeasonalEventName() {
  const event = advancedHaunting.getCurrentSeasonalEvent()
  return event ? `${event.icon} ${event.name}` : 'None'
}

// Set up event listeners for hooks
onMounted(() => {
  window.addEventListener('ie-navigate', handleIENavigate)
  window.addEventListener('file-deleted', handleFileDeleted)
  window.addEventListener('file-permanently-deleted', handleFilePermanentlyDeleted)
  window.addEventListener('recycle-bin-emptied', handleRecycleBinEmptied)
  window.addEventListener('shutdown-triggered', handleShutdown)
  window.addEventListener('ghost-jumpscare', handleGhostJumpscare)
  window.addEventListener('click', handleGlobalClick)
  
  // Check if debug UI should be enabled
  const debugEnabled = localStorage.getItem('necro-os-debug-ui') === 'true'
  showDebugUI.value = debugEnabled
  
  // Allow toggling debug UI with Ctrl+Shift+D
  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      showDebugUI.value = !showDebugUI.value
      localStorage.setItem('necro-os-debug-ui', showDebugUI.value.toString())
      console.log(`[Desktop] Debug UI ${showDebugUI.value ? 'enabled' : 'disabled'}`)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('ie-navigate', handleIENavigate)
  window.removeEventListener('file-deleted', handleFileDeleted)
  window.removeEventListener('file-permanently-deleted', handleFilePermanentlyDeleted)
  window.removeEventListener('recycle-bin-emptied', handleRecycleBinEmptied)
  window.removeEventListener('shutdown-triggered', handleShutdown)
  window.removeEventListener('ghost-jumpscare', handleGhostJumpscare)
  window.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.desktop {
  background-color: #008080;
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.desktop-icons {
  display: grid;
  grid-template-columns: repeat(auto-fill, 80px);
  gap: 20px;
  padding: 20px;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, 80px);
}

.desktop-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  padding: 5px;
  will-change: transform, opacity, filter;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.desktop-icon:hover {
  background-color: rgba(0, 0, 128, 0.3);
}

.icon-image {
  font-size: 32px;
  margin-bottom: 5px;
}

.icon-label {
  color: white;
  font-size: 11px;
  text-align: center;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  word-wrap: break-word;
  max-width: 70px;
}

/* Ghost icon styles */
.ghost-icon {
  position: absolute;
  pointer-events: none;
  cursor: default;
  animation: ghost-pulse 2s ease-in-out infinite;
  will-change: opacity, transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.ghost-icon:hover {
  background-color: transparent;
}

.ghost-icon.fading-out {
  animation: ghost-fade-out 2s ease-out forwards;
}

@keyframes ghost-pulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes ghost-fade-out {
  from {
    opacity: 0.5;
  }
  to {
    opacity: 0;
  }
}

@keyframes wallpaper-flash {
  0% {
    filter: brightness(150%);
  }
  100% {
    filter: brightness(100%);
  }
}

/* Context Menu Styles */
.context-menu {
  position: fixed;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  min-width: 150px;
  z-index: 10002;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  padding: 2px;
  will-change: transform;
}

.context-menu-item {
  display: flex;
  align-items: center;
  padding: 4px 20px 4px 4px;
  cursor: pointer;
  user-select: none;
  gap: 8px;
}

.context-menu-item:hover {
  background: #000080;
  color: #ffffff;
}

.context-menu-separator {
  height: 1px;
  background: #808080;
  margin: 2px 0;
  border-top: 1px solid #ffffff;
}

.menu-icon {
  font-size: 14px;
  width: 16px;
  text-align: center;
}

/* Debug UI Styles */
.debug-ui {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 10003;
  pointer-events: none;
}

.debug-panel {
  background: rgba(0, 0, 0, 0.85);
  border: 2px solid #00ff00;
  border-radius: 4px;
  padding: 12px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #00ff00;
  min-width: 250px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.debug-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid #00ff00;
  text-align: center;
}

.debug-item {
  display: flex;
  justify-content: space-between;
  margin: 4px 0;
  padding: 2px 0;
}

.debug-label {
  color: #00cc00;
  margin-right: 8px;
}

.debug-value {
  color: #00ff00;
  font-weight: bold;
  text-align: right;
}

.debug-hint {
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid #00ff00;
  font-size: 10px;
  color: #00aa00;
  text-align: center;
  font-style: italic;
}
</style>
