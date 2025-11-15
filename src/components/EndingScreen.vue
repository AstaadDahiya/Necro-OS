<template>
  <div v-if="visible" class="ending-screen" :class="`ending-${ending}`">
    <div class="ending-overlay" :style="overlayStyle"></div>
    
    <div class="ending-content">
      <div class="ending-icon">{{ endingIcon }}</div>
      <h1 class="ending-title">{{ endingTitle }}</h1>
      <p class="ending-message">{{ endingMessage }}</p>
      
      <div class="ending-statistics">
        <h3>Session Statistics</h3>
        <div class="stat-row">
          <span class="stat-label">Time Survived:</span>
          <span class="stat-value">{{ formattedSessionTime }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Final Possession Level:</span>
          <span class="stat-value">{{ possessionLevel }}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Exorcisms Performed:</span>
          <span class="stat-value">{{ exorcismsPerformed }}</span>
        </div>
        <div class="stat-row">
          <span class="stat-label">Total Sessions:</span>
          <span class="stat-value">{{ totalSessions }}</span>
        </div>
      </div>
      
      <div class="ending-actions">
        <button @click="restart" class="ending-button restart-button">
          {{ restartButtonText }}
        </button>
        <button v-if="canContinue" @click="continueSession" class="ending-button continue-button">
          Continue Playing
        </button>
      </div>
    </div>
    
    <!-- Audio element for ending sounds -->
    <audio ref="endingAudio" :src="endingAudioSrc" @ended="onAudioEnded"></audio>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'

export default {
  name: 'EndingScreen',
  
  setup() {
    const advancedHaunting = useAdvancedHauntingStore()
    
    const visible = ref(false)
    const ending = ref(null)
    const endingAudio = ref(null)
    
    // Ending configurations
    const endingConfigs = {
      survivor: {
        title: 'Survivor',
        message: 'You survived the night. The spirits have retreated... for now.',
        icon: '🌅',
        overlayColor: 'rgba(255, 200, 100, 0.3)',
        audioSrc: null,
        canContinue: true
      },
      consumed: {
        title: 'Consumed',
        message: 'The darkness has taken you. Your soul belongs to the void now.',
        icon: '💀',
        overlayColor: 'rgba(0, 0, 0, 0.95)',
        audioSrc: null,
        canContinue: false
      },
      purified: {
        title: 'Purified',
        message: 'The darkness has been banished. Peace is restored.',
        icon: '✨',
        overlayColor: 'rgba(255, 255, 255, 0.9)',
        audioSrc: null,
        canContinue: false
      },
      possessed: {
        title: 'Possessed',
        message: 'You are mine now.',
        icon: '👁️',
        overlayColor: 'rgba(139, 0, 0, 0.9)',
        audioSrc: null,
        canContinue: false
      }
    }
    
    // Computed properties
    const endingConfig = computed(() => {
      return ending.value ? endingConfigs[ending.value] : null
    })
    
    const endingTitle = computed(() => endingConfig.value?.title || '')
    const endingMessage = computed(() => endingConfig.value?.message || '')
    const endingIcon = computed(() => endingConfig.value?.icon || '')
    const overlayStyle = computed(() => ({
      backgroundColor: endingConfig.value?.overlayColor || 'rgba(0, 0, 0, 0.8)'
    }))
    const endingAudioSrc = computed(() => endingConfig.value?.audioSrc || null)
    const canContinue = computed(() => endingConfig.value?.canContinue || false)
    
    const possessionLevel = computed(() => advancedHaunting.possessionLevel)
    const exorcismsPerformed = computed(() => advancedHaunting.statistics.exorcismsPerformed)
    const totalSessions = computed(() => advancedHaunting.statistics.totalSessions)
    
    const formattedSessionTime = computed(() => {
      if (!advancedHaunting.sessionStartTime) return '0:00'
      
      const duration = Date.now() - advancedHaunting.sessionStartTime
      const minutes = Math.floor(duration / 60000)
      const seconds = Math.floor((duration % 60000) / 1000)
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })
    
    const restartButtonText = computed(() => {
      if (ending.value === 'survivor') return 'Start New Session'
      if (ending.value === 'purified') return 'Start Fresh'
      return 'Try Again'
    })
    
    // Methods
    const showEnding = (endingType) => {
      ending.value = endingType
      visible.value = true
      
      console.log(`[EndingScreen] Showing ${endingType} ending`)
      
      // Play ending audio if available
      if (endingAudioSrc.value && endingAudio.value) {
        endingAudio.value.play().catch(err => {
          console.error('[EndingScreen] Failed to play ending audio:', err)
        })
      }
      
      // Apply special visual effects based on ending type
      applyEndingEffects(endingType)
    }
    
    const applyEndingEffects = (endingType) => {
      const body = document.body
      
      switch (endingType) {
        case 'purified':
          // Golden light effect
          body.style.animation = 'purified-glow 2s ease-in-out'
          setTimeout(() => {
            body.style.animation = ''
          }, 2000)
          break
          
        case 'possessed':
          // Full screen corruption effect
          body.style.filter = 'invert(1) hue-rotate(180deg) saturate(3)'
          body.style.animation = 'possessed-shake 0.5s infinite'
          break
          
        case 'consumed':
          // Fade to black
          body.style.animation = 'consumed-fade 3s ease-in'
          break
          
        case 'survivor':
          // Gentle sunrise glow
          body.style.animation = 'survivor-dawn 3s ease-in-out'
          setTimeout(() => {
            body.style.animation = ''
          }, 3000)
          break
      }
    }
    
    const restart = () => {
      console.log('[EndingScreen] Restarting session')
      
      // Clear visual effects
      document.body.style.filter = ''
      document.body.style.animation = ''
      
      // Clear progress and restart
      advancedHaunting.clearProgress()
      
      // Hide ending screen
      visible.value = false
      ending.value = null
      
      // Reload the page to start fresh
      window.location.reload()
    }
    
    const continueSession = () => {
      console.log('[EndingScreen] Continuing session')
      
      // Clear visual effects
      document.body.style.filter = ''
      document.body.style.animation = ''
      
      // Clear the ending flag to allow playing
      advancedHaunting.endingReached = null
      
      // Hide ending screen
      visible.value = false
      ending.value = null
      
      // Resume session
      advancedHaunting.startSession()
    }
    
    const onAudioEnded = () => {
      console.log('[EndingScreen] Ending audio finished')
    }
    
    // Event handlers
    const handleEndingReached = (event) => {
      const { ending: endingType } = event.detail
      showEnding(endingType)
    }
    
    const handleConsumedWarning = (event) => {
      const { timestamp, possessionLevel: prevPossession } = event.detail
      
      // Show a warning message about the consumed ending
      const timeSince = Date.now() - timestamp
      const hoursSince = Math.floor(timeSince / (1000 * 60 * 60))
      
      console.log(`[EndingScreen] Consumed warning: ${hoursSince} hours ago at ${prevPossession}% possession`)
      
      // You could show a modal or notification here
      // For now, just log it
      setTimeout(() => {
        alert(`Warning: You were consumed by the darkness ${hoursSince} hours ago. The spirits remember...`)
      }, 2000)
    }
    
    // Lifecycle
    onMounted(() => {
      window.addEventListener('necro-ending-reached', handleEndingReached)
      window.addEventListener('necro-consumed-warning', handleConsumedWarning)
      
      console.log('[EndingScreen] Component mounted')
    })
    
    onUnmounted(() => {
      window.removeEventListener('necro-ending-reached', handleEndingReached)
      window.removeEventListener('necro-consumed-warning', handleConsumedWarning)
      
      // Clean up visual effects
      document.body.style.filter = ''
      document.body.style.animation = ''
      
      console.log('[EndingScreen] Component unmounted')
    })
    
    return {
      visible,
      ending,
      endingTitle,
      endingMessage,
      endingIcon,
      overlayStyle,
      endingAudioSrc,
      canContinue,
      possessionLevel,
      exorcismsPerformed,
      totalSessions,
      formattedSessionTime,
      restartButtonText,
      endingAudio,
      restart,
      continueSession,
      onAudioEnded
    }
  }
}
</script>

<style scoped>
.ending-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ending-fade-in 1s ease-in;
}

.ending-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: background-color 2s ease;
}

.ending-content {
  position: relative;
  z-index: 10001;
  background: rgba(0, 0, 0, 0.9);
  border: 2px solid #666;
  padding: 40px;
  max-width: 600px;
  width: 90%;
  text-align: center;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.8);
  animation: ending-content-appear 1.5s ease-out;
}

.ending-icon {
  font-size: 80px;
  margin-bottom: 20px;
  animation: ending-icon-pulse 2s ease-in-out infinite;
}

.ending-title {
  font-size: 48px;
  font-weight: bold;
  margin: 0 0 20px 0;
  color: #fff;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  font-family: 'Courier New', monospace;
}

.ending-message {
  font-size: 20px;
  color: #ccc;
  margin: 0 0 40px 0;
  line-height: 1.6;
  font-family: 'Courier New', monospace;
}

.ending-statistics {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid #444;
  padding: 20px;
  margin-bottom: 30px;
  text-align: left;
}

.ending-statistics h3 {
  margin: 0 0 15px 0;
  color: #fff;
  font-size: 18px;
  text-align: center;
  font-family: 'Courier New', monospace;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #333;
  font-family: 'Courier New', monospace;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-label {
  color: #aaa;
  font-size: 14px;
}

.stat-value {
  color: #fff;
  font-weight: bold;
  font-size: 14px;
}

.ending-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.ending-button {
  padding: 12px 30px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  border: 2px solid #666;
  background: #222;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.ending-button:hover {
  background: #444;
  border-color: #888;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
}

.ending-button:active {
  transform: translateY(0);
}

.restart-button {
  background: #8b0000;
  border-color: #ff0000;
}

.restart-button:hover {
  background: #a00000;
}

.continue-button {
  background: #006400;
  border-color: #00ff00;
}

.continue-button:hover {
  background: #007800;
}

/* Ending-specific styles */
.ending-purified .ending-content {
  border-color: gold;
  box-shadow: 0 0 50px rgba(255, 215, 0, 0.5);
}

.ending-purified .ending-title {
  color: gold;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.8);
}

.ending-possessed .ending-content {
  border-color: #8b0000;
  box-shadow: 0 0 50px rgba(139, 0, 0, 0.8);
  animation: ending-possessed-shake 0.5s infinite;
}

.ending-possessed .ending-title {
  color: #ff0000;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.8);
}

.ending-consumed .ending-content {
  border-color: #000;
  box-shadow: 0 0 50px rgba(0, 0, 0, 1);
}

.ending-survivor .ending-content {
  border-color: #ffa500;
  box-shadow: 0 0 50px rgba(255, 165, 0, 0.5);
}

.ending-survivor .ending-title {
  color: #ffa500;
  text-shadow: 0 0 20px rgba(255, 165, 0, 0.6);
}

/* Animations */
@keyframes ending-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes ending-content-appear {
  from {
    opacity: 0;
    transform: scale(0.8) translateY(50px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes ending-icon-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

@keyframes ending-possessed-shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px) rotate(-1deg);
  }
  75% {
    transform: translateX(5px) rotate(1deg);
  }
}

/* Global body animations (applied via JavaScript) */
@keyframes purified-glow {
  0% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(2) saturate(0);
  }
  100% {
    filter: brightness(1);
  }
}

@keyframes possessed-shake {
  0%, 100% {
    transform: translateX(0);
  }
  10% {
    transform: translateX(-10px) rotate(-2deg);
  }
  20% {
    transform: translateX(10px) rotate(2deg);
  }
  30% {
    transform: translateX(-10px) rotate(-2deg);
  }
  40% {
    transform: translateX(10px) rotate(2deg);
  }
  50% {
    transform: translateX(-10px) rotate(-2deg);
  }
  60% {
    transform: translateX(10px) rotate(2deg);
  }
  70% {
    transform: translateX(-10px) rotate(-2deg);
  }
  80% {
    transform: translateX(10px) rotate(2deg);
  }
  90% {
    transform: translateX(-10px) rotate(-2deg);
  }
}

@keyframes consumed-fade {
  from {
    filter: brightness(1);
  }
  to {
    filter: brightness(0);
  }
}

@keyframes survivor-dawn {
  0% {
    filter: brightness(0.5) sepia(0.8);
  }
  100% {
    filter: brightness(1.2) sepia(0.2);
  }
}
</style>
