<template>
  <div v-if="showCue" class="audio-visual-cue" :class="cueType" role="status" aria-live="polite">
    <div class="cue-icon">{{ cueIcon }}</div>
    <div class="cue-label">{{ cueLabel }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'

const advancedHaunting = useAdvancedHauntingStore()

const showCue = ref(false)
const cueType = ref('')
const cueIcon = ref('')
const cueLabel = ref('')

let cueTimeout = null

const displayCue = (type, icon, label, duration = 3000) => {
  // Only show if visual cues are enabled
  if (!advancedHaunting.customization.visualCuesForAudio) {
    return
  }
  
  cueType.value = type
  cueIcon.value = icon
  cueLabel.value = label
  showCue.value = true
  
  // Clear existing timeout
  if (cueTimeout) {
    clearTimeout(cueTimeout)
  }
  
  // Hide after duration
  cueTimeout = setTimeout(() => {
    showCue.value = false
  }, duration)
}

// Listen for audio events
const handleAudioEvent = (event) => {
  const { audioType, detail } = event.detail || {}
  
  switch (audioType) {
    case 'distant-scream':
      displayCue('ambient', '😱', 'Distant Scream')
      break
    case 'phantom-typing':
      displayCue('effects', '⌨️', 'Phantom Typing')
      break
    case 'hdd-grinding':
      displayCue('effects', '💿', 'Hard Drive Grinding')
      break
    case 'whisper':
      displayCue('whispers', '👻', `Whisper: ${detail || '...'}`)
      break
    case 'heartbeat':
      displayCue('tension', '💓', 'Heartbeat')
      break
    case 'jumpscare':
      displayCue('jumpscare', '⚠️', 'Jumpscare!', 2000)
      break
    default:
      displayCue('generic', '🔊', 'Audio Event')
  }
}

onMounted(() => {
  // Listen for custom audio events
  window.addEventListener('necro-audio-event', handleAudioEvent)
  console.log('[AudioVisualCue] Audio visual cue component mounted')
})

onUnmounted(() => {
  window.removeEventListener('necro-audio-event', handleAudioEvent)
  
  if (cueTimeout) {
    clearTimeout(cueTimeout)
  }
})
</script>

<style scoped>
.audio-visual-cue {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: rgba(0, 0, 0, 0.9);
  border: 2px solid #fff;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 9999;
  font-family: 'MS Sans Serif', sans-serif;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.cue-icon {
  font-size: 24px;
  line-height: 1;
}

.cue-label {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  white-space: nowrap;
}

/* Type-specific styling */
.audio-visual-cue.ambient {
  border-color: #4a90e2;
}

.audio-visual-cue.effects {
  border-color: #9b59b6;
}

.audio-visual-cue.whispers {
  border-color: #e74c3c;
}

.audio-visual-cue.tension {
  border-color: #f39c12;
}

.audio-visual-cue.jumpscare {
  border-color: #c0392b;
  animation: pulse 0.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .audio-visual-cue {
    animation: none;
  }
  
  .audio-visual-cue.jumpscare {
    animation: none;
  }
}

body.reduced-motion .audio-visual-cue {
  animation: none;
}

body.reduced-motion .audio-visual-cue.jumpscare {
  animation: none;
}
</style>
