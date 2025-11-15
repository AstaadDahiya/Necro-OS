<template>
  <PhotosensitivityWarning />
  <BIOSScreen ref="biosScreenRef" @complete="onBiosComplete" />
  <BootSequence ref="bootSequenceRef" @complete="onBootComplete" />
  <Desktop v-if="bootComplete" />
  <DifficultySelector />
  <ExorcismPuzzle />
  <AchievementNotification />
  <EndingScreen />
  <AudioVisualCue />
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import Desktop from './components/Desktop.vue'
import BIOSScreen from './components/BIOSScreen.vue'
import BootSequence from './components/BootSequence.vue'
import DifficultySelector from './components/DifficultySelector.vue'
import ExorcismPuzzle from './components/ExorcismPuzzle.vue'
import AchievementNotification from './components/AchievementNotification.vue'
import EndingScreen from './components/EndingScreen.vue'
import PhotosensitivityWarning from './components/PhotosensitivityWarning.vue'
import AudioVisualCue from './components/AudioVisualCue.vue'
import { useGhostBehaviorStore } from './stores/ghostBehavior'
import { useWindowManagerStore } from './stores/windowManager'
import { useCursedAI } from './stores/cursedAI'
import { useVisualCorruptionStore } from './stores/visualCorruption'
import { useAdvancedHauntingStore } from './stores/advancedHaunting'
import { audioService } from './utils/audioService'
import { preloadJumpscares } from './utils/jumpscareService'
import { gameplayService } from './utils/gameplayService'

// Initialize Pinia stores
const ghostBehavior = useGhostBehaviorStore()
const windowManager = useWindowManagerStore()
const cursedAI = useCursedAI()
const visualCorruption = useVisualCorruptionStore()
const advancedHaunting = useAdvancedHauntingStore()

// Boot sequence
const biosScreenRef = ref(null)
const bootSequenceRef = ref(null)
const bootComplete = ref(false)

const onBiosComplete = () => {
  // Start Windows boot sequence after BIOS
  if (bootSequenceRef.value) {
    bootSequenceRef.value.start()
  }
}

const onBootComplete = async () => {
  bootComplete.value = true
  
  // Preload jumpscares after boot sequence
  try {
    await preloadJumpscares()
    console.log('Jumpscares preloaded')
  } catch (error) {
    console.error('Failed to preload jumpscares:', error)
    // Continue anyway - app should still work
  }
  
  // Initialize services with the advanced haunting store for feature checks
  try {
    const { initializePossessedAppsService } = await import('./utils/possessedAppsService.js')
    initializePossessedAppsService(advancedHaunting)
    console.log('Possessed apps service initialized with store')
  } catch (error) {
    console.error('Failed to initialize possessed apps service:', error)
  }
  
  try {
    const { audioHauntingService } = await import('./utils/audioHauntingService.js')
    audioHauntingService.setStore(advancedHaunting)
    console.log('Audio haunting service initialized with store')
  } catch (error) {
    console.error('Failed to initialize audio haunting service:', error)
  }
  
  // Initialize advanced haunting system
  advancedHaunting.initialize()
  
  // Initialize gameplay service (cursed files, exorcism mechanics)
  gameplayService.initialize()
  
  // Start idle detection and haunting escalation after boot
  ghostBehavior.startIdleDetection()
  ghostBehavior.startEscalation()
}

onMounted(async () => {
  console.log('Necro-OS initialized')
  
  // Initialize audio service
  await audioService.init()
  
  // Resume audio context on first user interaction
  const resumeAudio = async () => {
    await audioService.resume()
    document.removeEventListener('click', resumeAudio)
    document.removeEventListener('keydown', resumeAudio)
  }
  document.addEventListener('click', resumeAudio)
  document.addEventListener('keydown', resumeAudio)
  
  // Initialize visual corruption integration with ghost behavior
  visualCorruption.initializeHauntingIntegration()
  
  // Start BIOS screen first
  if (biosScreenRef.value) {
    biosScreenRef.value.start()
  }
})

onUnmounted(() => {
  // Cleanup ghost behavior timers
  ghostBehavior.cleanup()
  
  // Cleanup advanced haunting
  advancedHaunting.cleanup()
})
</script>

<style>
/* Global styles are in desktop.css */

/* Reduced motion accessibility support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

body.reduced-motion *,
body.reduced-motion *::before,
body.reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Disable flashing and rapid visual changes in reduced motion mode */
body.reduced-motion .wallpaper-flicker,
body.reduced-motion .glitch-effect,
body.reduced-motion .corruption-effect {
  animation: none !important;
  opacity: 1 !important;
}

/* Keyboard focus indicators for accessibility */
*:focus-visible {
  outline: 2px solid #000080;
  outline-offset: 2px;
}

button:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline: 2px dotted #000;
  outline-offset: 2px;
}
</style>
