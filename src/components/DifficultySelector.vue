<template>
  <div v-if="isVisible" class="difficulty-selector-overlay">
    <div class="difficulty-selector-container">
      <div class="selector-header">
        <h2>⚠️ Choose Your Fate ⚠️</h2>
        <p class="selector-instructions">Select the intensity of your haunting experience</p>
      </div>

      <div class="difficulty-options">
        <!-- Tourist Mode -->
        <div 
          class="difficulty-option"
          :class="{ 'option-selected': selectedDifficulty === 'tourist' }"
          @click="selectDifficulty('tourist')"
        >
          <div class="option-icon">🌙</div>
          <h3 class="option-title">Tourist Mode</h3>
          <p class="option-description">A gentle introduction to the haunting</p>
          <ul class="option-details">
            <li>Slow possession increase (0.5 pts/min)</li>
            <li>More time to react</li>
            <li>Perfect for first-time visitors</li>
          </ul>
        </div>

        <!-- Normal Mode -->
        <div 
          class="difficulty-option"
          :class="{ 'option-selected': selectedDifficulty === 'normal' }"
          @click="selectDifficulty('normal')"
        >
          <div class="option-icon">👻</div>
          <h3 class="option-title">Normal</h3>
          <p class="option-description">The intended haunting experience</p>
          <ul class="option-details">
            <li>Standard possession increase (1.5 pts/min)</li>
            <li>Balanced challenge</li>
            <li>Recommended for most players</li>
          </ul>
        </div>

        <!-- Nightmare Mode -->
        <div 
          class="difficulty-option"
          :class="{ 'option-selected': selectedDifficulty === 'nightmare' }"
          @click="selectDifficulty('nightmare')"
        >
          <div class="option-icon">💀</div>
          <h3 class="option-title">Nightmare</h3>
          <p class="option-description">For those who dare to face true terror</p>
          <ul class="option-details">
            <li>Starts at 40% possession</li>
            <li>Rapid possession increase (3 pts/min)</li>
            <li>Intense haunting from the start</li>
          </ul>
        </div>

        <!-- Permadeath Mode -->
        <div 
          class="difficulty-option"
          :class="{ 'option-selected': selectedDifficulty === 'permadeath' }"
          @click="selectDifficulty('permadeath')"
        >
          <div class="option-icon">⚰️</div>
          <h3 class="option-title">Permadeath</h3>
          <p class="option-description">One chance. No second tries.</p>
          <ul class="option-details">
            <li>Standard possession increase (1.5 pts/min)</li>
            <li>BSOD clears all progress</li>
            <li>For the truly brave</li>
          </ul>
        </div>
      </div>

      <div class="selector-actions">
        <button 
          class="btn-confirm" 
          @click="confirmSelection"
          :disabled="!selectedDifficulty"
        >
          Begin Haunting
        </button>
      </div>

      <div class="selector-warning">
        <p>⚠️ This choice cannot be changed during your session ⚠️</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'

export default {
  name: 'DifficultySelector',
  
  setup() {
    const advancedHaunting = useAdvancedHauntingStore()
    const isVisible = ref(false)
    const selectedDifficulty = ref(null)

    /**
     * Select a difficulty
     */
    const selectDifficulty = (difficulty) => {
      selectedDifficulty.value = difficulty
      console.log(`[DifficultySelector] Selected difficulty: ${difficulty}`)
    }

    /**
     * Confirm selection and start game
     */
    const confirmSelection = () => {
      if (!selectedDifficulty.value) {
        return
      }

      console.log(`[DifficultySelector] Confirming difficulty: ${selectedDifficulty.value}`)
      
      // Set difficulty in store
      advancedHaunting.setDifficulty(selectedDifficulty.value)
      
      // Mark that difficulty has been selected
      try {
        localStorage.setItem('necro-os-difficulty-selected', 'true')
      } catch (error) {
        console.error('[DifficultySelector] Failed to save selection flag:', error)
      }
      
      // Close selector
      isVisible.value = false
      
      // Emit event to notify that difficulty has been selected
      window.dispatchEvent(new CustomEvent('difficulty-selected', {
        detail: { difficulty: selectedDifficulty.value }
      }))
    }

    /**
     * Show the difficulty selector
     */
    const show = () => {
      isVisible.value = true
      selectedDifficulty.value = null
      console.log('[DifficultySelector] Showing difficulty selector')
    }

    /**
     * Check if this is first launch
     */
    const checkFirstLaunch = () => {
      try {
        const hasSelected = localStorage.getItem('necro-os-difficulty-selected')
        const hasSavedProgress = localStorage.getItem('necro-os-advanced-haunting')
        
        // Show selector if:
        // 1. User has never selected difficulty before
        // 2. AND there's no saved progress (fresh start)
        if (!hasSelected && !hasSavedProgress) {
          console.log('[DifficultySelector] First launch detected, showing selector')
          // Show after a short delay to let boot sequence complete
          setTimeout(() => {
            show()
          }, 500)
        } else {
          console.log('[DifficultySelector] Not first launch, skipping selector')
        }
      } catch (error) {
        console.error('[DifficultySelector] Failed to check first launch:', error)
      }
    }

    /**
     * Handle keyboard input
     */
    const handleKeyPress = (event) => {
      if (!isVisible.value) return

      // Number keys 1-4 to select difficulty
      const numKey = parseInt(event.key)
      if (numKey >= 1 && numKey <= 4) {
        const difficulties = ['tourist', 'normal', 'nightmare', 'permadeath']
        selectDifficulty(difficulties[numKey - 1])
      }

      // Enter to confirm
      if (event.key === 'Enter' && selectedDifficulty.value) {
        confirmSelection()
      }
    }

    /**
     * Handle custom event to show selector
     */
    const handleShowSelector = () => {
      show()
    }

    onMounted(() => {
      // Check if this is first launch
      checkFirstLaunch()
      
      // Listen for custom event to show selector
      window.addEventListener('show-difficulty-selector', handleShowSelector)
      window.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      window.removeEventListener('show-difficulty-selector', handleShowSelector)
      window.removeEventListener('keydown', handleKeyPress)
    })

    return {
      isVisible,
      selectedDifficulty,
      selectDifficulty,
      confirmSelection
    }
  }
}
</script>

<style scoped>
.difficulty-selector-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
  backdrop-filter: blur(8px);
}

.difficulty-selector-container {
  background: linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 100%);
  border: 3px solid #8b0000;
  border-radius: 15px;
  padding: 40px;
  max-width: 1000px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 0 50px rgba(139, 0, 0, 0.7), inset 0 0 30px rgba(0, 0, 0, 0.7);
  animation: fade-in 0.5s ease-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.selector-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #8b0000;
  padding-bottom: 20px;
}

.selector-header h2 {
  color: #ff6b6b;
  font-family: 'Courier New', monospace;
  font-size: 32px;
  margin: 0 0 15px 0;
  text-shadow: 0 0 15px rgba(255, 107, 107, 0.7);
  animation: pulse-text 2s ease-in-out infinite;
}

@keyframes pulse-text {
  0%, 100% {
    text-shadow: 0 0 15px rgba(255, 107, 107, 0.7);
  }
  50% {
    text-shadow: 0 0 25px rgba(255, 107, 107, 1);
  }
}

.selector-instructions {
  color: #ccc;
  font-size: 16px;
  margin: 0;
  font-style: italic;
}

.difficulty-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.difficulty-option {
  background: rgba(0, 0, 0, 0.5);
  border: 3px solid #444;
  border-radius: 10px;
  padding: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.difficulty-option:hover {
  border-color: #8b0000;
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(139, 0, 0, 0.5);
}

.option-selected {
  border-color: #ff6b6b;
  background: rgba(139, 0, 0, 0.2);
  box-shadow: 0 0 30px rgba(255, 107, 107, 0.5);
}

.option-icon {
  font-size: 48px;
  margin-bottom: 15px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.option-title {
  color: #ff6b6b;
  font-family: 'Courier New', monospace;
  font-size: 20px;
  margin: 0 0 10px 0;
  text-transform: uppercase;
}

.option-description {
  color: #aaa;
  font-size: 14px;
  margin: 0 0 15px 0;
  font-style: italic;
}

.option-details {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.option-details li {
  color: #ccc;
  font-size: 13px;
  margin: 8px 0;
  padding-left: 20px;
  position: relative;
}

.option-details li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: #8b0000;
}

.selector-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.btn-confirm {
  padding: 15px 40px;
  font-size: 18px;
  font-weight: bold;
  background: linear-gradient(135deg, #8b0000 0%, #ff6b6b 100%);
  border: 3px solid #ff6b6b;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
  box-shadow: 0 5px 15px rgba(139, 0, 0, 0.5);
}

.btn-confirm:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff6b6b 0%, #8b0000 100%);
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.7);
}

.btn-confirm:active:not(:disabled) {
  transform: scale(0.98);
}

.btn-confirm:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  background: #444;
  border-color: #666;
}

.selector-warning {
  text-align: center;
  padding: 15px;
  background: rgba(139, 0, 0, 0.2);
  border: 2px solid #8b0000;
  border-radius: 8px;
}

.selector-warning p {
  color: #ff6b6b;
  font-size: 14px;
  margin: 0;
  font-weight: bold;
  font-family: 'Courier New', monospace;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .difficulty-options {
    grid-template-columns: 1fr;
  }
  
  .selector-header h2 {
    font-size: 24px;
  }
  
  .difficulty-selector-container {
    padding: 25px;
  }
}
</style>
