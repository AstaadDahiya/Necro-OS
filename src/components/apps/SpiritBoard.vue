<template>
  <div class="spirit-board">
    <!-- Ouija Board -->
    <div class="board-container">
      <svg class="ouija-board" viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg">
        <!-- Board background -->
        <rect width="800" height="600" fill="#d4a574" rx="20" />
        <rect x="10" y="10" width="780" height="580" fill="#c19a6b" rx="15" stroke="#8b7355" stroke-width="2" />
        
        <!-- Decorative corners -->
        <circle cx="50" cy="50" r="15" fill="#8b7355" opacity="0.3" />
        <circle cx="750" cy="50" r="15" fill="#8b7355" opacity="0.3" />
        <circle cx="50" cy="550" r="15" fill="#8b7355" opacity="0.3" />
        <circle cx="750" cy="550" r="15" fill="#8b7355" opacity="0.3" />
        
        <!-- YES and NO -->
        <text x="150" y="120" class="board-text control-text" text-anchor="middle">YES</text>
        <text x="650" y="120" class="board-text control-text" text-anchor="middle">NO</text>
        
        <!-- First row of letters (A-M) -->
        <text 
          v-for="(letter, index) in row1Letters" 
          :key="'row1-' + letter"
          :x="80 + (index * 52)"
          y="220"
          class="board-text letter-text"
          :class="{ 'current-letter': currentLetter === letter }"
          text-anchor="middle"
        >
          {{ letter }}
        </text>
        
        <!-- Second row of letters (N-Z) -->
        <text 
          v-for="(letter, index) in row2Letters" 
          :key="'row2-' + letter"
          :x="80 + (index * 52)"
          y="320"
          class="board-text letter-text"
          :class="{ 'current-letter': currentLetter === letter }"
          text-anchor="middle"
        >
          {{ letter }}
        </text>
        
        <!-- Numbers (1-0) -->
        <text 
          v-for="(num, index) in numbers" 
          :key="'num-' + num"
          :x="120 + (index * 64)"
          y="420"
          class="board-text number-text"
          :class="{ 'current-letter': currentLetter === num }"
          text-anchor="middle"
        >
          {{ num }}
        </text>
        
        <!-- GOODBYE -->
        <text x="400" y="520" class="board-text control-text" text-anchor="middle">GOODBYE</text>
        
        <!-- Planchette -->
        <g 
          :transform="`translate(${planchettePosition.x}, ${planchettePosition.y})`"
          class="planchette"
        >
          <!-- Planchette body (teardrop shape) -->
          <ellipse cx="0" cy="0" rx="40" ry="50" fill="rgba(139, 115, 85, 0.7)" stroke="#5d4e37" stroke-width="2" />
          <circle cx="0" cy="-10" r="30" fill="rgba(139, 115, 85, 0.7)" stroke="#5d4e37" stroke-width="2" />
          
          <!-- Viewing window (circle with crosshairs) -->
          <circle cx="0" cy="-10" r="12" fill="rgba(255, 255, 255, 0.9)" stroke="#5d4e37" stroke-width="1.5" />
          <line x1="-12" y1="-10" x2="12" y2="-10" stroke="#5d4e37" stroke-width="1" />
          <line x1="0" y1="-22" x2="0" y2="2" stroke="#5d4e37" stroke-width="1" />
        </g>
      </svg>
    </div>
    
    <!-- Question input area -->
    <div class="question-area">
      <div class="question-label">Ask the spirits:</div>
      <div class="input-row">
        <input 
          v-model="question"
          type="text"
          class="question-input"
          placeholder="Type your question..."
          :disabled="isAnimating"
          @keyup.enter="submitQuestion"
        />
        <button 
          @click="submitQuestion"
          :disabled="isAnimating || !question.trim()"
          class="submit-button"
        >
          {{ isAnimating ? 'Channeling...' : 'Ask' }}
        </button>
      </div>
      
      <!-- Response display -->
      <div v-if="response" class="response-area">
        <div class="response-label">The spirits say:</div>
        <div class="response-text">{{ response }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useWindowManagerStore } from '../../stores/windowManager'
import geminiService from '../../utils/geminiService'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const windowManager = useWindowManagerStore()

// Board layout data
const row1Letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']
const row2Letters = ['N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']

// State
const question = ref('')
const response = ref('')
const planchettePosition = ref({ x: 400, y: 300 }) // Center of board
const currentLetter = ref('')
const isAnimating = ref(false)

/**
 * Calculate the SVG coordinates for a character on the Ouija board
 * 
 * The board layout is organized as follows:
 * - YES (top-left) and NO (top-right) at y=120
 * - First letter row (A-M) at y=220, starting at x=80 with 52px spacing
 * - Second letter row (N-Z) at y=320, starting at x=80 with 52px spacing
 * - Numbers (1-0) at y=420, starting at x=120 with 64px spacing
 * - GOODBYE (bottom-center) at y=520
 * 
 * @param {string} char - The character to locate (letter, number, or control word)
 * @returns {Object} Position object with x and y coordinates in SVG space
 */
function calculateLetterPosition(char) {
  const upperChar = char.toUpperCase()
  
  // Check YES control word (top-left position)
  if (upperChar === 'Y' && char === 'YES') {
    return { x: 150, y: 120 }
  }
  
  // Check NO control word (top-right position)
  if (upperChar === 'N' && char === 'NO') {
    return { x: 650, y: 120 }
  }
  
  // Check GOODBYE control word (bottom-center position)
  if (char === 'GOODBYE') {
    return { x: 400, y: 520 }
  }
  
  // Check first row letters (A-M)
  // Formula: x = 80 (left margin) + (index * 52 (letter spacing))
  const row1Index = row1Letters.indexOf(upperChar)
  if (row1Index !== -1) {
    return { x: 80 + (row1Index * 52), y: 220 }
  }
  
  // Check second row letters (N-Z)
  // Formula: x = 80 (left margin) + (index * 52 (letter spacing))
  const row2Index = row2Letters.indexOf(upperChar)
  if (row2Index !== -1) {
    return { x: 80 + (row2Index * 52), y: 320 }
  }
  
  // Check numbers (1-0)
  // Formula: x = 120 (left margin) + (index * 64 (number spacing))
  const numIndex = numbers.indexOf(upperChar)
  if (numIndex !== -1) {
    return { x: 120 + (numIndex * 64), y: 420 }
  }
  
  // Default to center position if character not found
  return { x: 400, y: 300 }
}

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Speak letter using Web Speech API
function speakLetter(char) {
  // Check if Web Speech API is available
  if (!('speechSynthesis' in window)) {
    console.warn('Web Speech API not supported')
    return
  }
  
  const utterance = new SpeechSynthesisUtterance(char)
  utterance.pitch = 0.7  // Lower pitch for creepy effect
  utterance.rate = 0.8   // Slower rate
  utterance.volume = 0.4 // Quieter volume (whisper)
  
  speechSynthesis.speak(utterance)
}

/**
 * Animate the planchette to spell out a message letter-by-letter
 * 
 * This is the core animation algorithm that creates the supernatural Ouija board effect.
 * The planchette moves smoothly between letters using CSS transitions (defined in styles).
 * 
 * Animation sequence for each character:
 * 1. Calculate target position on board
 * 2. Update planchette position (triggers CSS transition for smooth movement)
 * 3. Highlight the current letter with glow effect
 * 4. Whisper the letter using Web Speech API
 * 5. Pause for 800ms to let user see the letter
 * 6. Move to next character
 * 
 * After spelling the complete message:
 * 1. Move planchette to GOODBYE position
 * 2. Pause for 1 second
 * 3. Return to center position
 * 
 * Performance optimization: Uses requestAnimationFrame to sync position updates
 * with browser repaint cycle, ensuring smooth 60fps animation.
 * 
 * @param {string} message - The message to spell out (letters, numbers, spaces)
 */
async function animatePlanchette(message) {
  isAnimating.value = true
  response.value = ''
  let fullResponse = ''
  
  // Iterate through each character in the message
  for (const char of message) {
    // Handle spaces - pause without moving planchette
    // This creates natural word separation in multi-word responses
    if (char === ' ') {
      await delay(500)
      fullResponse += char
      response.value = fullResponse
      continue
    }
    
    const upperChar = char.toUpperCase()
    
    // Calculate the SVG coordinates for this character
    const position = calculateLetterPosition(upperChar)
    
    // Update planchette position using requestAnimationFrame
    // This ensures the position update happens during the browser's repaint cycle
    // for optimal performance and smooth animation (synced with 60fps refresh)
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        planchettePosition.value = position
        resolve()
      })
    })
    
    // Highlight current letter with golden glow effect (see .current-letter CSS)
    currentLetter.value = upperChar
    
    // Whisper the letter using Web Speech API for audio feedback
    speakLetter(upperChar)
    
    // Build response text incrementally so user sees message being spelled
    fullResponse += char
    response.value = fullResponse
    
    // Pause on letter for 800ms to give user time to see it
    // This timing creates the authentic Ouija board pacing
    await delay(800)
  }
  
  // Clear current letter highlight after message is complete
  currentLetter.value = ''
  
  // Move to GOODBYE position to signal end of communication
  await delay(500)
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      planchettePosition.value = calculateLetterPosition('GOODBYE')
      resolve()
    })
  })
  await delay(1000)
  
  // Return planchette to center position (resting state)
  await new Promise(resolve => {
    requestAnimationFrame(() => {
      planchettePosition.value = { x: 400, y: 300 }
      resolve()
    })
  })
  
  isAnimating.value = false
}

// Submit question and get response from Gemini API
async function submitQuestion() {
  if (!question.value.trim() || isAnimating.value) return
  
  const userQuestion = question.value
  question.value = '' // Clear input
  response.value = 'Channeling spirits...'
  
  try {
    // Build system prompt for supernatural entity
    const openWindows = windowManager.openWindows.map(w => w.title).join(', ')
    const sessionContext = openWindows ? `Open applications: ${openWindows}` : 'No applications open'
    
    const systemPrompt = `You are a supernatural entity communicating through a Ouija board in a haunted Windows 95 computer called Necro-OS.

Your personality:
- Ancient, mysterious, and cryptic
- Speak in short, ominous phrases (max 30 characters)
- Reference the user's digital activities when relevant
- Be unsettling but not overtly threatening
- Use archaic or mystical language
- Sometimes answer questions, sometimes deflect mysteriously

Session context: ${sessionContext}

User question: ${userQuestion}

Respond as the spirit would through the Ouija board. Keep it SHORT (max 30 characters) - the planchette must spell it out letter by letter. Use only letters, numbers, and spaces. No punctuation.`

    // Get response from Gemini
    const aiResponse = await geminiService.chat(systemPrompt)
    
    // Clean response - remove punctuation and limit length
    let cleanResponse = aiResponse
      .replace(/[^a-zA-Z0-9\s]/g, '') // Remove punctuation
      .trim()
      .substring(0, 50) // Limit length
      .toUpperCase()
    
    // If response is empty, use fallback
    if (!cleanResponse) {
      cleanResponse = 'THE SPIRITS ARE SILENT'
    }
    
    // Animate the planchette spelling out the response
    await animatePlanchette(cleanResponse)
    
  } catch (error) {
    console.error('Spirit Board error:', error)
    response.value = 'The spirits are disturbed...'
    
    // Animate fallback message
    await animatePlanchette('CONNECTION LOST')
  }
}
</script>

<style scoped>
.spirit-board {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.board-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.ouija-board {
  max-width: 100%;
  max-height: 100%;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.5));
}

/* Board text styling */
.board-text {
  font-family: 'Brush Script MT', cursive, 'MS Sans Serif', sans-serif;
  fill: #2c1810;
  font-weight: bold;
  user-select: none;
}

.control-text {
  font-size: 48px;
  letter-spacing: 4px;
}

.letter-text {
  font-size: 42px;
  transition: all 0.3s ease;
}

.number-text {
  font-size: 38px;
  transition: all 0.3s ease;
}

/* Current letter glow effect */
.current-letter {
  fill: #8b0000;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6));
  font-size: 48px !important;
}

/* Planchette styling */
.planchette {
  transition: transform 0.5s ease-in-out;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4));
  will-change: transform;
}

/* Question area */
.question-area {
  background-color: rgba(0, 0, 0, 0.3);
  border: 2px solid #8b7355;
  border-radius: 4px;
  padding: 15px;
}

.question-label {
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 12px;
  color: #d4a574;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.input-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.question-input {
  flex: 1;
  padding: 4px 8px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  border: 2px solid #808080;
  background-color: white;
}

.question-input:disabled {
  background-color: #c0c0c0;
  color: #808080;
}

.submit-button {
  padding: 4px 16px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  cursor: pointer;
  min-width: 80px;
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

/* Response area */
.response-area {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #8b7355;
}

.response-label {
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  color: #d4a574;
  margin-bottom: 6px;
  font-style: italic;
}

.response-text {
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 12px;
  color: #ffffff;
  line-height: 1.4;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
}
</style>
