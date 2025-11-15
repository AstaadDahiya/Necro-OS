<template>
  <div v-if="isVisible" class="bsod" tabindex="0">
    <div class="bsod-content">
      <h1 class="bsod-title">Windows</h1>
      
      <div v-if="riddle.question" class="riddle-section">
        <p class="bsod-message riddle-question" :style="trembleStyle">{{ riddle.question }}</p>
        
        <div class="input-section">
          <p class="input-prompt">Type your answer:</p>
          <p class="user-input">{{ userInput }}_</p>
        </div>
        
        <div v-if="riddle.attempts > 0" class="error-feedback" :style="trembleStyle">
          <p>WRONG! Attempts: {{ riddle.attempts }}</p>
          <p class="tremble-text" :style="trembleStyle">The truth trembles before you...</p>
        </div>
      </div>
      
      <div v-else class="loading-section">
        <p class="bsod-message">Generating your punishment...</p>
      </div>
      
      <div class="bsod-details">
        <p>* Type your answer and press ENTER to escape.</p>
        <p>* Wrong answers will make the text harder to read.</p>
        <p>* There is no other way out.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useWindowManagerStore } from '../stores/windowManager';
import { useAdvancedHauntingStore } from '../stores/advancedHaunting';
import geminiService from '../utils/geminiService';

const isVisible = ref(false);
const userInput = ref('');
const riddle = ref({
  question: '',
  answer: '',
  context: '',
  attempts: 0,
  trembleIntensity: 0
});

const emit = defineEmits(['close']);

// Computed style for tremble animation
const trembleStyle = computed(() => {
  if (riddle.value.trembleIntensity === 0) return {};
  
  const duration = Math.max(0.1, 1 - (riddle.value.trembleIntensity * 0.08));
  return {
    '--tremble-duration': `${duration}s`,
    animation: `tremble ${duration}s infinite`
  };
});

// Gather session context from user actions
const gatherSessionContext = () => {
  const windowManager = useWindowManagerStore();
  const actions = [];
  
  // Collect opened windows
  if (windowManager.openWindows.length > 0) {
    const appNames = windowManager.openWindows.map(w => w.appName).join(', ');
    actions.push(`opened these applications: ${appNames}`);
  }
  
  // Collect minimized windows
  if (windowManager.minimizedWindows.length > 0) {
    const minNames = windowManager.minimizedWindows.map(w => w.appName).join(', ');
    actions.push(`minimized: ${minNames}`);
  }
  
  // Add window count
  actions.push(`had ${windowManager.openWindows.length} windows open`);
  
  return actions.length > 0 ? actions.join(', ') : 'did nothing interesting';
};

// Generate riddle using Gemini API
const generateRiddle = async () => {
  try {
    const context = gatherSessionContext();
    riddle.value.context = context;
    
    console.log('[BSOD] Generating riddle with context:', context);
    console.log('[BSOD] API Key present:', !!import.meta.env.VITE_GEMINI_API_KEY);
    
    const prompt = `You are generating a creepy riddle for a haunted Windows 95 BSOD screen. 
Based on this user activity: "${context}"

Create a riddle that references something specific they did. Format it like:
"I saw you [specific action]. What was [specific detail about that action]?"

Keep it under 40 words. Make it eerie and direct.
Then on a new line write "ANSWER:" followed by a simple one or two word answer.

Example:
"I watched you open that application. What was its name?"
ANSWER: notepad

Now generate a riddle based on the user's actual actions.`;

    const response = await geminiService.chat(prompt);
    console.log('[BSOD] Received response:', response);
    
    // Parse response to extract question and answer
    const parts = response.split('ANSWER:');
    if (parts.length >= 2) {
      riddle.value.question = parts[0].trim().replace(/^["']|["']$/g, '');
      riddle.value.answer = parts[1].trim().toLowerCase().replace(/^["']|["']$/g, '');
    } else {
      // Fallback riddle if parsing fails
      riddle.value.question = "I saw you using this cursed machine. What do you seek?";
      riddle.value.answer = "escape";
    }
    
    riddle.value.attempts = 0;
    riddle.value.trembleIntensity = 0;
    console.log('[BSOD] Riddle generated successfully');
  } catch (error) {
    console.error('[BSOD] Failed to generate riddle:', error);
    console.error('[BSOD] Error details:', error.message, error.status);
    // Fallback riddle
    riddle.value.question = "I am watching you. What is the name of your fear?";
    riddle.value.answer = "death";
    riddle.value.attempts = 0;
    riddle.value.trembleIntensity = 0;
  }
};

// Handle keyboard input
const handleKeyPress = (event) => {
  // Only handle keys when BSOD is visible
  if (!isVisible.value) return;
  
  if (event.key === 'Enter') {
    checkAnswer();
  } else if (event.key === 'Backspace') {
    userInput.value = userInput.value.slice(0, -1);
  } else if (event.key.length === 1 && /[a-zA-Z0-9 ]/.test(event.key)) {
    userInput.value += event.key;
  }
  
  // Prevent default behavior
  event.preventDefault();
};

// Check answer and handle validation
const checkAnswer = () => {
  const normalized = userInput.value.toLowerCase().trim();
  const correctAnswer = riddle.value.answer.toLowerCase().trim();
  
  if (normalized === correctAnswer || normalized.includes(correctAnswer)) {
    // Correct answer - restore session
    restoreSession();
  } else {
    // Wrong answer - increase punishment
    riddle.value.attempts++;
    riddle.value.trembleIntensity = Math.min(10, riddle.value.attempts * 2);
    userInput.value = '';
  }
};

// Restore session and dismiss BSOD
const restoreSession = () => {
  isVisible.value = false;
  userInput.value = '';
  riddle.value = {
    question: '',
    answer: '',
    context: '',
    attempts: 0,
    trembleIntensity: 0
  };
  emit('close');
};

// Trigger BSOD with riddle generation
const trigger = async () => {
  // Check for permadeath mode
  const advancedHaunting = useAdvancedHauntingStore();
  if (advancedHaunting.difficulty === 'permadeath') {
    console.log('[BSOD] Permadeath mode detected - clearing all progress');
    
    // Clear all progress
    advancedHaunting.clearProgress();
    
    // Also clear the difficulty selection flag to force re-selection
    try {
      localStorage.removeItem('necro-os-difficulty-selected');
    } catch (error) {
      console.error('[BSOD] Failed to clear difficulty selection:', error);
    }
    
    // Show a special permadeath message
    riddle.value.question = "PERMADEATH MODE: All progress has been lost. The spirits have claimed you.";
    riddle.value.answer = "restart";
    riddle.value.attempts = 0;
    riddle.value.trembleIntensity = 0;
    
    isVisible.value = true;
    userInput.value = '';
    
    // Focus the element
    setTimeout(() => {
      const element = document.querySelector('.bsod');
      if (element) {
        element.focus();
      }
    }, 100);
    
    return;
  }
  
  isVisible.value = true;
  userInput.value = '';
  
  // Focus the element to capture keyboard events
  setTimeout(() => {
    const element = document.querySelector('.bsod');
    if (element) {
      element.focus();
    }
  }, 100);
  
  // Generate riddle
  await generateRiddle();
};

// Setup keyboard listener
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});

defineExpose({ trigger });
</script>


<style scoped>
.bsod {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #0000aa;
  color: #ffffff;
  font-family: 'Courier New', monospace;
  z-index: 99998;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
}

.bsod-content {
  max-width: 80%;
  padding: 40px;
}

.bsod-title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 30px;
  text-align: center;
}

.bsod-message {
  font-size: 1rem;
  line-height: 1.5;
  margin-bottom: 30px;
  white-space: pre-wrap;
}

.riddle-section {
  margin-bottom: 40px;
}

.riddle-question {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 30px;
  padding: 20px;
  border: 2px solid #ffffff;
  background: rgba(0, 0, 170, 0.8);
}

.input-section {
  margin: 20px 0;
}

.input-prompt {
  font-size: 0.9rem;
  margin-bottom: 10px;
  color: #aaaaaa;
}

.user-input {
  font-size: 1.2rem;
  font-weight: bold;
  padding: 10px;
  background: #000088;
  border: 1px solid #ffffff;
  min-height: 30px;
  letter-spacing: 2px;
}

.error-feedback {
  margin-top: 20px;
  padding: 15px;
  border: 2px solid #ff0000;
  background: rgba(170, 0, 0, 0.3);
}

.error-feedback p {
  margin: 5px 0;
  font-weight: bold;
}

.tremble-text {
  color: #ffaaaa;
  font-size: 0.9rem;
}

.loading-section {
  margin-bottom: 40px;
}

.bsod-details {
  font-size: 0.9rem;
  line-height: 1.6;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #ffffff;
}

.bsod-details p {
  margin: 5px 0;
}

/* Tremble animation with 10 transform steps */
@keyframes tremble {
  0% { 
    transform: translate(0, 0) rotate(0deg); 
  }
  10% { 
    transform: translate(-3px, 2px) rotate(-1.5deg); 
  }
  20% { 
    transform: translate(3px, -2px) rotate(1.5deg); 
  }
  30% { 
    transform: translate(-2px, 3px) rotate(-1deg); 
  }
  40% { 
    transform: translate(2px, -3px) rotate(1deg); 
  }
  50% { 
    transform: translate(-4px, -1px) rotate(-2deg); 
  }
  60% { 
    transform: translate(4px, 1px) rotate(2deg); 
  }
  70% { 
    transform: translate(-1px, -4px) rotate(-0.5deg); 
  }
  80% { 
    transform: translate(1px, 4px) rotate(0.5deg); 
  }
  90% { 
    transform: translate(-3px, 2px) rotate(-1.5deg); 
  }
  100% { 
    transform: translate(0, 0) rotate(0deg); 
  }
}
</style>
