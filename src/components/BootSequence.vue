<template>
  <div v-if="isVisible" class="boot-sequence">
    <div class="boot-content">
      <div class="boot-logo">
        <h1>Windows 95</h1>
        <p class="boot-subtitle">Necro-OS Edition</p>
      </div>
      
      <div class="boot-progress">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="boot-text">{{ bootText }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { audioService } from '../utils/audioService';

const isVisible = ref(false);
const progress = ref(0);
const bootText = ref('Starting Windows 95...');

const bootMessages = [
  'Starting Windows 95...',
  'Loading system files...',
  'Initializing drivers...',
  'Loading cursed components...',
  'Summoning digital spirits...',
  'Awakening the ghost in the machine...',
  'Starting Necro-OS...',
];

let progressInterval = null;
let messageIndex = 0;

const emit = defineEmits(['complete']);

const start = () => {
  isVisible.value = true;
  progress.value = 0;
  messageIndex = 0;
  bootText.value = bootMessages[0];
  
  // Animate progress bar
  progressInterval = setInterval(() => {
    progress.value += 2;
    
    // Update boot message at certain progress points
    const messageProgress = Math.floor((progress.value / 100) * bootMessages.length);
    if (messageProgress > messageIndex && messageProgress < bootMessages.length) {
      messageIndex = messageProgress;
      bootText.value = bootMessages[messageIndex];
    }
    
    // Complete when progress reaches 100%
    if (progress.value >= 100) {
      clearInterval(progressInterval);
      progressInterval = null;

      // Play startup sound using audioService
      audioService.play('startup');
      
      // Auto-dismiss after a short delay
      setTimeout(() => {
        isVisible.value = false;
        emit('complete');
      }, 1000);
    }
  }, 50); // Update every 50ms for smooth animation
};

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});

defineExpose({ start });
</script>

<style scoped>
.boot-sequence {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  color: #fff;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'MS Sans Serif', Arial, sans-serif;
}

.boot-content {
  text-align: center;
  width: 80%;
  max-width: 600px;
}

.boot-logo {
  margin-bottom: 60px;
}

.boot-logo h1 {
  font-size: 3rem;
  margin: 0;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.boot-subtitle {
  font-size: 1.2rem;
  color: #aaa;
  margin-top: 10px;
}

.boot-progress {
  margin-top: 40px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background: #333;
  border: 2px solid #666;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0000aa 0%, #0000ff 100%);
  transition: width 0.05s linear;
}

.boot-text {
  margin-top: 20px;
  font-size: 1rem;
  color: #ccc;
}
</style>
