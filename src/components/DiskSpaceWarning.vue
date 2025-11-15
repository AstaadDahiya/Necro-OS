<template>
  <div 
    v-if="isVisible"
    class="disk-space-warning-overlay"
  >
    <div 
      class="disk-space-warning"
      :class="{ 'shake': isShaking }"
      :style="{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }"
    >
      <!-- Title bar -->
      <div class="warning-titlebar">
        <div class="warning-title">
          <span class="warning-icon-title">⚠️</span>
          Low Disk Space
        </div>
        <button 
          class="warning-close-btn"
          @click="handleCloseClick"
        >
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="warning-content">
        <div class="warning-icon-large">⚠️</div>
        <div class="warning-message">
          <p>You are running out of disk space on Drive C:.</p>
          <p class="warning-space">{{ remainingSpace }} MB remaining</p>
          <p class="warning-hint">To free space on this drive, delete old or unnecessary files.</p>
        </div>
      </div>

      <!-- Button -->
      <div class="warning-footer">
        <button 
          class="warning-ok-btn"
          @click="handleOkClick"
        >
          OK
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { audioService } from '../utils/audioService'

const props = defineProps({
  warningId: {
    type: String,
    required: true
  },
  offset: {
    type: Object,
    default: () => ({ x: 0, y: 0 })
  }
})

const emit = defineEmits(['close-attempt', 'ok-attempt'])

const isVisible = ref(true)
const isShaking = ref(false)
const remainingSpace = ref(666)

// Calculate position (center of screen + offset)
const position = computed(() => {
  const centerX = window.innerWidth / 2 - 200 // 200 is half the dialog width
  const centerY = window.innerHeight / 2 - 100 // 100 is half the dialog height
  
  return {
    x: centerX + props.offset.x,
    y: centerY + props.offset.y
  }
})

// Handle X button click - shake and refuse to close
function handleCloseClick() {
  // Play error sound
  audioService.play('error')
  
  // Trigger shake animation
  isShaking.value = true
  
  // Emit close attempt event
  emit('close-attempt', props.warningId)
  
  // Reset shake after animation
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

// Handle OK button click - will reappear after delay
function handleOkClick() {
  // Play error sound
  audioService.play('error')
  
  // Emit OK attempt event
  emit('ok-attempt', props.warningId)
  
  // Hide temporarily
  isVisible.value = false
  
  // Reappear after 3-5 seconds
  const delay = Math.random() * 2000 + 3000 // 3000-5000ms
  setTimeout(() => {
    isVisible.value = true
    audioService.play('error')
  }, delay)
}

// Play sound when component appears
onMounted(() => {
  audioService.play('error')
})
</script>

<style scoped>
.disk-space-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9500;
  pointer-events: none;
}

.disk-space-warning {
  position: absolute;
  width: 400px;
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  pointer-events: auto;
}

.warning-titlebar {
  background: linear-gradient(to right, #000080, #1084d0);
  color: white;
  padding: 3px 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: bold;
  cursor: move;
}

.warning-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
}

.warning-icon-title {
  font-size: 12px;
}

.warning-close-btn {
  background: #c0c0c0;
  border: 1px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  width: 16px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  font-weight: bold;
  padding: 0;
  line-height: 1;
}

.warning-close-btn:active {
  border-color: #000000 #ffffff #ffffff #000000;
}

.warning-content {
  padding: 15px;
  display: flex;
  gap: 15px;
  align-items: flex-start;
}

.warning-icon-large {
  font-size: 32px;
  flex-shrink: 0;
}

.warning-message {
  flex: 1;
  color: #000000;
  line-height: 1.4;
}

.warning-message p {
  margin: 0 0 10px 0;
}

.warning-message p:last-child {
  margin-bottom: 0;
}

.warning-space {
  font-weight: bold;
  color: #800000;
}

.warning-hint {
  font-size: 10px;
  color: #404040;
}

.warning-footer {
  padding: 10px 15px 15px;
  display: flex;
  justify-content: center;
}

.warning-ok-btn {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #000000 #000000 #ffffff;
  padding: 5px 20px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  cursor: pointer;
  min-width: 75px;
}

.warning-ok-btn:active {
  border-color: #000000 #ffffff #ffffff #000000;
  padding: 6px 19px 4px 21px;
}

/* Shake animation */
.shake {
  animation: shake 0.5s;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}
</style>
