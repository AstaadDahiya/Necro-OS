<template>
  <div v-if="isVisible" class="exorcism-puzzle-overlay" @click.self="handleCancel">
    <div class="exorcism-puzzle-container">
      <div class="puzzle-header">
        <h2>🕯 Exorcism Ritual 🕯</h2>
        <p class="puzzle-instructions">Replicate the symbol sequence to banish the spirits</p>
      </div>

      <div class="puzzle-content">
        <!-- Timer -->
        <div class="puzzle-timer" :class="{ 'timer-warning': timeRemaining <= 10 }">
          <span class="timer-icon">⏱</span>
          <span class="timer-value">{{ timeRemaining }}s</span>
        </div>

        <!-- Symbol Sequence Display -->
        <div class="symbol-sequence">
          <div 
            v-for="(symbol, index) in puzzle.sequence" 
            :key="index"
            class="symbol-display"
            :class="{ 'symbol-revealed': index < revealedCount }"
          >
            {{ index < revealedCount ? symbol : '?' }}
          </div>
        </div>

        <!-- User Input Area -->
        <div class="symbol-input">
          <div 
            v-for="(symbol, index) in userInput" 
            :key="index"
            class="symbol-input-slot"
            :class="{ 'slot-filled': symbol }"
          >
            {{ symbol || '_' }}
          </div>
        </div>

        <!-- Symbol Selector -->
        <div class="symbol-selector">
          <button
            v-for="symbol in availableSymbols"
            :key="symbol"
            class="symbol-button"
            @click="addSymbol(symbol)"
            :disabled="userInput.length >= puzzle.length"
          >
            {{ symbol }}
          </button>
        </div>

        <!-- Action Buttons -->
        <div class="puzzle-actions">
          <button class="btn-clear" @click="clearInput" :disabled="userInput.length === 0">
            Clear
          </button>
          <button class="btn-submit" @click="submitSolution" :disabled="userInput.length !== puzzle.length">
            Submit Exorcism
          </button>
          <button class="btn-cancel" @click="handleCancel">
            Cancel
          </button>
        </div>

        <!-- Feedback Message -->
        <div v-if="feedbackMessage" class="feedback-message" :class="feedbackType">
          {{ feedbackMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { gameplayService } from '../utils/gameplayService'

export default {
  name: 'ExorcismPuzzle',
  
  setup() {
    const isVisible = ref(false)
    const puzzle = ref(null)
    const userInput = ref([])
    const timeRemaining = ref(30)
    const revealedCount = ref(0)
    const feedbackMessage = ref('')
    const feedbackType = ref('')
    let timerInterval = null
    let revealInterval = null

    const availableSymbols = ['⛧', '☠', '👁', '🕯', '⚰', '🗡', '🔮', '💀', '👻', '🕷']

    /**
     * Start the puzzle
     */
    const startPuzzle = (difficulty = 'normal') => {
      // Generate new puzzle
      puzzle.value = gameplayService.generateSymbolPuzzle(difficulty)
      
      if (!puzzle.value) {
        console.error('[ExorcismPuzzle] Failed to generate puzzle')
        return
      }

      // Reset state
      userInput.value = []
      timeRemaining.value = puzzle.value.timeLimit
      revealedCount.value = 0
      feedbackMessage.value = ''
      feedbackType.value = ''
      isVisible.value = true

      // Start timer
      startTimer()

      // Reveal symbols gradually
      startReveal()

      console.log('[ExorcismPuzzle] Puzzle started:', puzzle.value)
    }

    /**
     * Start countdown timer
     */
    const startTimer = () => {
      if (timerInterval) {
        clearInterval(timerInterval)
      }

      timerInterval = setInterval(() => {
        timeRemaining.value--

        if (timeRemaining.value <= 0) {
          handleTimeout()
        }
      }, 1000)
    }

    /**
     * Gradually reveal symbols
     */
    const startReveal = () => {
      if (revealInterval) {
        clearInterval(revealInterval)
      }

      // Reveal all symbols immediately for now
      // (Can be changed to gradual reveal if desired)
      revealedCount.value = puzzle.value.length

      // Alternative: Gradual reveal
      // revealInterval = setInterval(() => {
      //   if (revealedCount.value < puzzle.value.length) {
      //     revealedCount.value++
      //   } else {
      //     clearInterval(revealInterval)
      //   }
      // }, 500)
    }

    /**
     * Add symbol to user input
     */
    const addSymbol = (symbol) => {
      if (userInput.value.length < puzzle.value.length) {
        userInput.value.push(symbol)
        feedbackMessage.value = ''
      }
    }

    /**
     * Clear user input
     */
    const clearInput = () => {
      userInput.value = []
      feedbackMessage.value = ''
    }

    /**
     * Submit solution
     */
    const submitSolution = () => {
      if (userInput.value.length !== puzzle.value.length) {
        showFeedback('Complete the sequence first', 'error')
        return
      }

      // Perform puzzle exorcism
      const result = gameplayService.performPuzzleExorcism(puzzle.value.id, userInput.value)

      if (result.success) {
        showFeedback(`Success! Possession reduced by ${result.reductionAmount} points`, 'success')
        
        // Close puzzle after short delay
        setTimeout(() => {
          closePuzzle()
        }, 2000)
      } else {
        if (result.reason === 'cooldown') {
          showFeedback('Exorcism ritual on cooldown. Wait before trying again.', 'error')
          setTimeout(() => {
            closePuzzle()
          }, 2000)
        } else {
          showFeedback('Incorrect sequence! The spirits resist...', 'error')
          // Allow retry
          userInput.value = []
        }
      }
    }

    /**
     * Handle timeout
     */
    const handleTimeout = () => {
      clearInterval(timerInterval)
      showFeedback('Time expired! The ritual failed...', 'error')
      
      setTimeout(() => {
        closePuzzle()
      }, 2000)
    }

    /**
     * Handle cancel
     */
    const handleCancel = () => {
      gameplayService.cancelPuzzle()
      closePuzzle()
    }

    /**
     * Close puzzle
     */
    const closePuzzle = () => {
      isVisible.value = false
      clearInterval(timerInterval)
      clearInterval(revealInterval)
      puzzle.value = null
      userInput.value = []
      feedbackMessage.value = ''
    }

    /**
     * Show feedback message
     */
    const showFeedback = (message, type) => {
      feedbackMessage.value = message
      feedbackType.value = type
    }

    /**
     * Handle keyboard input
     */
    const handleKeyPress = (event) => {
      if (!isVisible.value) return

      // ESC to cancel
      if (event.key === 'Escape') {
        handleCancel()
        return
      }

      // Backspace to remove last symbol
      if (event.key === 'Backspace') {
        if (userInput.value.length > 0) {
          userInput.value.pop()
        }
        return
      }

      // Enter to submit
      if (event.key === 'Enter') {
        if (userInput.value.length === puzzle.value.length) {
          submitSolution()
        }
        return
      }

      // Number keys 1-9,0 to select symbols
      const numKey = parseInt(event.key)
      if (!isNaN(numKey)) {
        const index = numKey === 0 ? 9 : numKey - 1
        if (index >= 0 && index < availableSymbols.length) {
          addSymbol(availableSymbols[index])
        }
      }
    }

    // Listen for custom event to start puzzle
    const handleStartPuzzle = (event) => {
      const difficulty = event.detail?.difficulty || 'normal'
      startPuzzle(difficulty)
    }

    onMounted(() => {
      window.addEventListener('start-exorcism-puzzle', handleStartPuzzle)
      window.addEventListener('keydown', handleKeyPress)
    })

    onUnmounted(() => {
      window.removeEventListener('start-exorcism-puzzle', handleStartPuzzle)
      window.removeEventListener('keydown', handleKeyPress)
      clearInterval(timerInterval)
      clearInterval(revealInterval)
    })

    return {
      isVisible,
      puzzle,
      userInput,
      timeRemaining,
      revealedCount,
      feedbackMessage,
      feedbackType,
      availableSymbols,
      addSymbol,
      clearInput,
      submitSolution,
      handleCancel
    }
  }
}
</script>

<style scoped>
.exorcism-puzzle-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(5px);
}

.exorcism-puzzle-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border: 3px solid #8b0000;
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 0 30px rgba(139, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.5);
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(139, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 40px rgba(139, 0, 0, 0.7), inset 0 0 25px rgba(0, 0, 0, 0.7);
  }
}

.puzzle-header {
  text-align: center;
  margin-bottom: 25px;
  border-bottom: 2px solid #8b0000;
  padding-bottom: 15px;
}

.puzzle-header h2 {
  color: #ff6b6b;
  font-family: 'Courier New', monospace;
  font-size: 24px;
  margin: 0 0 10px 0;
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.puzzle-instructions {
  color: #ccc;
  font-size: 14px;
  margin: 0;
  font-style: italic;
}

.puzzle-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.puzzle-timer {
  text-align: center;
  font-size: 24px;
  color: #4ecdc4;
  font-weight: bold;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 5px;
  transition: all 0.3s ease;
}

.timer-warning {
  color: #ff6b6b;
  animation: timer-pulse 0.5s ease-in-out infinite;
}

@keyframes timer-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.timer-icon {
  margin-right: 10px;
}

.symbol-sequence {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border: 2px solid #4ecdc4;
}

.symbol-display {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px solid #666;
  border-radius: 5px;
  color: #999;
  transition: all 0.3s ease;
}

.symbol-revealed {
  color: #4ecdc4;
  border-color: #4ecdc4;
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.3);
  animation: symbol-reveal 0.5s ease-out;
}

@keyframes symbol-reveal {
  0% {
    transform: scale(0) rotate(180deg);
    opacity: 0;
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.symbol-input {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 20px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  border: 2px solid #ff6b6b;
  min-height: 90px;
}

.symbol-input-slot {
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  background: rgba(0, 0, 0, 0.5);
  border: 2px dashed #666;
  border-radius: 5px;
  color: #ccc;
  transition: all 0.3s ease;
}

.slot-filled {
  border-style: solid;
  border-color: #ff6b6b;
  color: #ff6b6b;
  box-shadow: 0 0 15px rgba(255, 107, 107, 0.3);
}

.symbol-selector {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  padding: 15px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
}

.symbol-button {
  width: 45px;
  height: 45px;
  font-size: 24px;
  background: rgba(78, 205, 196, 0.2);
  border: 2px solid #4ecdc4;
  border-radius: 5px;
  color: #4ecdc4;
  cursor: pointer;
  transition: all 0.2s ease;
}

.symbol-button:hover:not(:disabled) {
  background: rgba(78, 205, 196, 0.4);
  transform: scale(1.1);
  box-shadow: 0 0 15px rgba(78, 205, 196, 0.5);
}

.symbol-button:active:not(:disabled) {
  transform: scale(0.95);
}

.symbol-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.puzzle-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.puzzle-actions button {
  padding: 12px 24px;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Courier New', monospace;
  text-transform: uppercase;
}

.btn-clear {
  background: rgba(255, 193, 7, 0.2);
  border-color: #ffc107;
  color: #ffc107;
}

.btn-clear:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.4);
  box-shadow: 0 0 15px rgba(255, 193, 7, 0.5);
}

.btn-submit {
  background: rgba(76, 175, 80, 0.2);
  border-color: #4caf50;
  color: #4caf50;
}

.btn-submit:hover:not(:disabled) {
  background: rgba(76, 175, 80, 0.4);
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.btn-cancel {
  background: rgba(244, 67, 54, 0.2);
  border-color: #f44336;
  color: #f44336;
}

.btn-cancel:hover {
  background: rgba(244, 67, 54, 0.4);
  box-shadow: 0 0 15px rgba(244, 67, 54, 0.5);
}

.puzzle-actions button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.feedback-message {
  text-align: center;
  padding: 12px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 14px;
  animation: feedback-appear 0.3s ease-out;
}

@keyframes feedback-appear {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-message.success {
  background: rgba(76, 175, 80, 0.3);
  border: 2px solid #4caf50;
  color: #4caf50;
}

.feedback-message.error {
  background: rgba(244, 67, 54, 0.3);
  border: 2px solid #f44336;
  color: #f44336;
}
</style>
