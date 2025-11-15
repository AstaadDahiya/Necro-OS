<template>
  <div v-if="isVisible" class="bios-screen">
    <div class="bios-content">
      <div class="bios-text" v-html="displayedText"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useGhostBehaviorStore } from '../stores/ghostBehavior'

const isVisible = ref(false)
const displayedText = ref('')
const currentIndex = ref(0)
const biosText = ref('')
const typeTimer = ref(null)
const transitionTimer = ref(null)
const f13Pressed = ref(false)

const emit = defineEmits(['complete'])

// BIOS text template
const generateBiosText = () => {
  const showF13 = Math.random() < 0.1 // 10% chance for F13 Easter egg
  
  return `NECRO BIOS v6.66 (C) 1995 Cursed Technologies
Current Date: October 31, 1995

Detecting Hardware...
CPU: Spectral Processor 666 MHz
RAM: Testing... 64 MB... 128 MB... 256 MB... 512 MB... 666 MB OK
HDD: Haunted Drive C: 13 GB
GPU: Possessed Graphics Adapter
FDD: Spectral Floppy Drive A:

WARNING: Spectral entity detected in memory sector 0x666

Press DEL to enter SETUP${showF13 ? '\nPress F13 to enter the void' : ''}

Booting from C:\\...`
}

// Play PC speaker beep using Web Audio API
const playBeep = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.type = 'square'
    oscillator.frequency.value = 800 // 800 Hz
    
    gainNode.gain.value = 0.1 // Low volume
    
    oscillator.start()
    setTimeout(() => {
      oscillator.stop()
      audioContext.close()
    }, 100) // 100ms beep
  } catch (error) {
    console.error('Failed to play beep:', error)
  }
}

// Type text character by character
const typeText = () => {
  if (currentIndex.value < biosText.value.length) {
    const char = biosText.value[currentIndex.value]
    displayedText.value += char === '\n' ? '<br>' : char
    currentIndex.value++
    
    typeTimer.value = setTimeout(typeText, 20) // 20ms delay per character
  } else {
    // Typing complete, wait 5-8 seconds then transition
    const delay = 5000 + Math.random() * 3000 // 5-8 seconds
    transitionTimer.value = setTimeout(transitionToWindows, delay)
  }
}

// Transition to Windows boot sequence
const transitionToWindows = () => {
  if (f13Pressed.value) {
    // Show special message before transitioning
    displayedText.value += '<br><br>ENTERING THE VOID...<br>REALITY.SYS CORRUPTED<br>HAUNTING LEVEL: MAXIMUM'
    
    setTimeout(() => {
      isVisible.value = false
      emit('complete')
    }, 2000)
  } else {
    // Normal transition with fade out
    const biosScreen = document.querySelector('.bios-screen')
    if (biosScreen) {
      biosScreen.style.transition = 'opacity 1s ease-out'
      biosScreen.style.opacity = '0'
    }
    
    setTimeout(() => {
      isVisible.value = false
      emit('complete')
    }, 1000)
  }
}

// Handle F13 key press
const handleKeyDown = (event) => {
  if (event.key === 'F13' && !f13Pressed.value) {
    f13Pressed.value = true
    
    // Set haunting level to maximum
    const ghostBehavior = useGhostBehaviorStore()
    ghostBehavior.setHauntingLevel(10)
    
    // Clear transition timer and transition immediately
    if (transitionTimer.value) {
      clearTimeout(transitionTimer.value)
    }
    if (typeTimer.value) {
      clearTimeout(typeTimer.value)
    }
    
    // Complete typing immediately
    displayedText.value = biosText.value.replace(/\n/g, '<br>')
    
    // Show special message and transition
    setTimeout(() => {
      transitionToWindows()
    }, 500)
  }
}

// Start BIOS screen
const start = () => {
  isVisible.value = true
  displayedText.value = ''
  currentIndex.value = 0
  f13Pressed.value = false
  biosText.value = generateBiosText()
  
  // Play beep sound
  playBeep()
  
  // Start typing after a brief delay
  setTimeout(() => {
    typeText()
  }, 200)
  
  // Add keyboard listener
  window.addEventListener('keydown', handleKeyDown)
}

onUnmounted(() => {
  if (typeTimer.value) {
    clearTimeout(typeTimer.value)
  }
  if (transitionTimer.value) {
    clearTimeout(transitionTimer.value)
  }
  window.removeEventListener('keydown', handleKeyDown)
})

defineExpose({ start })
</script>

<style scoped>
.bios-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  color: #fff;
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
  overflow: hidden;
}

.bios-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  white-space: pre-wrap;
}

.bios-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.4;
  color: #fff;
  text-shadow: 0 0 2px rgba(255, 255, 255, 0.5);
}
</style>
