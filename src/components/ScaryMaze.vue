<template>
  <div 
    v-if="isVisible && currentVariant" 
    class="scary-maze-overlay" 
    :data-intensity="currentVariant.intensity"
    @click="dismiss"
  >
    <div class="jumpscare-content">
      <!-- Video jumpscare -->
      <video 
        v-if="currentVariant.type === 'video'"
        ref="videoElement"
        :src="currentVariant.media"
        class="jumpscare-video"
        autoplay
        playsinline
      />
      
      <!-- Image jumpscare -->
      <img 
        v-else-if="currentVariant.type === 'image'"
        :src="currentVariant.media" 
        alt="Jumpscare" 
        class="jumpscare-image"
      />
      
      <!-- Jumpscare text -->
      <div v-if="currentVariant.text" class="jumpscare-text">
        {{ currentVariant.text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { getRandomJumpscare, getJumpscareById } from '../utils/jumpscareService';

const props = defineProps({
  variant: {
    type: String,
    default: null
  }
});

const isVisible = ref(false);
const currentVariant = ref(null);
const videoElement = ref(null);
const audioElements = ref([]);
let dismissTimer = null;

const emit = defineEmits(['close']);

const trigger = async (variantId = null) => {
  // Get variant by ID or completely random
  if (variantId) {
    currentVariant.value = getJumpscareById(variantId);
  } else if (props.variant) {
    currentVariant.value = getJumpscareById(props.variant);
  } else {
    // Get completely random jumpscare (no intensity filtering)
    currentVariant.value = getRandomJumpscare();
  }
  
  if (!currentVariant.value) {
    console.error('No jumpscare variant found');
    return;
  }
  
  // Record jumpscare event in statistics
  try {
    const { useAdvancedHauntingStore } = await import('../stores/advancedHaunting');
    const hauntingStore = useAdvancedHauntingStore();
    
    // Add to jumpscares seen set (prevents repetition)
    hauntingStore.statistics.jumpscaresSeen.add(currentVariant.value.id);
    
    // Record event
    hauntingStore.recordEvent('jumpscare_triggered', {
      variantId: currentVariant.value.id,
      intensity: currentVariant.value.intensity,
      possessionLevel: hauntingStore.possessionLevel
    });
    
    // Trigger heartbeat ramp before jumpscare
    hauntingStore.triggerJumpscareHeartbeat();
  } catch (error) {
    console.error('Failed to record jumpscare event:', error);
  }
  
  isVisible.value = true;
  
  // Emit visual cue for accessibility
  window.dispatchEvent(new CustomEvent('necro-audio-event', {
    detail: { audioType: 'jumpscare', detail: currentVariant.value.id }
  }));
  
  // Check for Friday the 13th modifier
  try {
    const { useAdvancedHauntingStore } = await import('../stores/advancedHaunting');
    const hauntingStore = useAdvancedHauntingStore();
    
    if (hauntingStore.isFriday13Active()) {
      // Apply Friday the 13th modifier after a short delay
      setTimeout(async () => {
        const { metaHorrorService } = await import('../utils/metaHorrorService');
        const jumpscareElement = document.querySelector('.jumpscare-content');
        if (jumpscareElement) {
          metaHorrorService.injectFriday13Modifier(jumpscareElement);
        }
      }, 500);
    }
  } catch (error) {
    console.error('Failed to check Friday the 13th modifier:', error);
  }
  
  // Play video and audio
  playVideo();
  playAudio();
  
  // Auto-dismiss after variant duration
  dismissTimer = setTimeout(() => {
    dismiss();
  }, currentVariant.value.duration);
};

const playVideo = () => {
  if (currentVariant.value.type === 'video' && videoElement.value) {
    videoElement.value.volume = 1.0;
    videoElement.value.play().catch(err => {
      console.error('Video play failed:', err);
    });
  }
};

const playAudio = () => {
  if (!currentVariant.value.audio || currentVariant.value.audio.length === 0) {
    return;
  }
  
  // Clear previous audio elements
  audioElements.value = [];
  
  // Play all audio tracks
  currentVariant.value.audio.forEach(audioSrc => {
    try {
      const audio = new Audio(audioSrc);
      audio.volume = 0.8;
      audio.play().catch(err => {
        console.error('Audio play failed:', err);
      });
      audioElements.value.push(audio);
    } catch (err) {
      console.error('Failed to create audio:', err);
    }
  });
};

const stopAllMedia = () => {
  // Stop video
  if (videoElement.value) {
    videoElement.value.pause();
    videoElement.value.currentTime = 0;
  }
  
  // Stop all audio
  audioElements.value.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  audioElements.value = [];
};

const dismiss = () => {
  stopAllMedia();
  isVisible.value = false;
  currentVariant.value = null;
  
  if (dismissTimer) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  
  emit('close');
};

onUnmounted(() => {
  stopAllMedia();
  if (dismissTimer) {
    clearTimeout(dismissTimer);
  }
});

defineExpose({ trigger });

</script>

<style scoped>
.scary-maze-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  animation: flicker 0.05s infinite, colorShift 2s infinite;
}

.jumpscare-content {
  text-align: center;
  animation: shake 0.1s infinite;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.jumpscare-image {
  max-width: 80vw;
  max-height: 80vh;
  object-fit: contain;
  filter: brightness(1.2) contrast(1.3);
}

.jumpscare-video {
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  filter: brightness(1.3) contrast(1.5) saturate(1.2);
  animation: videoGlitch 0.3s infinite;
}

.jumpscare-text {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translateX(-50%);
  color: #ff0000;
  font-size: 3rem;
  font-weight: bold;
  text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000;
  margin-top: 20px;
  animation: pulse 0.5s infinite, textGlitch 0.2s infinite;
  white-space: nowrap;
  z-index: 100000;
}

/* More intense flicker animation */
@keyframes flicker {
  0%, 100% { opacity: 1; }
  25% { opacity: 0.8; }
  50% { opacity: 0.95; }
  75% { opacity: 0.85; }
}

/* Psychedelic color shift effect */
@keyframes colorShift {
  0% { filter: hue-rotate(0deg); }
  25% { filter: hue-rotate(90deg); }
  50% { filter: hue-rotate(180deg); }
  75% { filter: hue-rotate(270deg); }
  100% { filter: hue-rotate(360deg); }
}

@keyframes shake {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  10% { transform: translate(-8px, 8px) rotate(-3deg); }
  20% { transform: translate(8px, -8px) rotate(3deg); }
  30% { transform: translate(-8px, -8px) rotate(-2deg); }
  40% { transform: translate(8px, 8px) rotate(2deg); }
  50% { transform: translate(-6px, 6px) rotate(-3deg); }
  60% { transform: translate(6px, -6px) rotate(3deg); }
  70% { transform: translate(-6px, -6px) rotate(-2deg); }
  80% { transform: translate(6px, 6px) rotate(2deg); }
  90% { transform: translate(-4px, 4px) rotate(-1deg); }
}

@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.15); }
}

@keyframes videoGlitch {
  0%, 100% { 
    transform: translate(0, 0) scale(1);
    filter: brightness(1.3) contrast(1.5) saturate(1.2);
  }
  10% { 
    transform: translate(-5px, 0) scale(1.01);
    filter: brightness(1.5) contrast(1.8) saturate(1.5);
  }
  20% { 
    transform: translate(5px, 0) scale(0.99);
    filter: brightness(1.1) contrast(1.3) saturate(1.0);
  }
  30% { 
    transform: translate(0, -5px) scale(1.02);
    filter: brightness(1.4) contrast(1.6) saturate(1.3);
  }
  40% { 
    transform: translate(0, 5px) scale(0.98);
    filter: brightness(1.2) contrast(1.4) saturate(1.1);
  }
}

@keyframes textGlitch {
  0%, 100% { 
    transform: translateX(-50%) skew(0deg);
    text-shadow: 0 0 20px #ff0000, 0 0 40px #ff0000, 0 0 60px #ff0000;
  }
  25% { 
    transform: translateX(-50%) skew(-2deg);
    text-shadow: -5px 0 20px #ff0000, 5px 0 40px #00ff00, 0 0 60px #0000ff;
  }
  50% { 
    transform: translateX(-50%) skew(2deg);
    text-shadow: 5px 0 20px #ff0000, -5px 0 40px #00ff00, 0 0 60px #0000ff;
  }
  75% { 
    transform: translateX(-50%) skew(-1deg);
    text-shadow: 0 -5px 20px #ff0000, 0 5px 40px #00ff00, 0 0 60px #0000ff;
  }
}

/* Intensity-based variations */
.scary-maze-overlay[data-intensity="1"] {
  animation: flicker 0.1s infinite;
}

.scary-maze-overlay[data-intensity="2"] {
  animation: flicker 0.08s infinite;
}

.scary-maze-overlay[data-intensity="3"] {
  animation: flicker 0.06s infinite, colorShift 2s infinite;
}

.scary-maze-overlay[data-intensity="4"] {
  animation: flicker 0.05s infinite, colorShift 1.5s infinite;
}

.scary-maze-overlay[data-intensity="5"] {
  animation: flicker 0.03s infinite, colorShift 1s infinite;
}
</style>
