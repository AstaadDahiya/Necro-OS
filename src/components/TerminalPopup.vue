<template>
  <div class="terminal-container">
    <div class="terminal-screen">
      <!-- Display completed log lines -->
      <div 
        v-for="(log, index) in logs" 
        :key="index" 
        class="terminal-line"
        v-html="log"
      ></div>
      
      <!-- Current line being typed -->
      <div v-if="currentLine" class="terminal-line">
        <span v-html="currentLine"></span>
        <span v-if="cursorVisible" class="terminal-cursor">_</span>
      </div>
      
      <!-- Blinking cursor when idle -->
      <div v-else-if="!isTyping && logs.length > 0" class="terminal-line">
        <span class="terminal-cursor">_</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useVisualCorruptionStore } from '../stores/visualCorruption'
import { useWindowManagerStore } from '../stores/windowManager'
import geminiService from '../utils/geminiService'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const visualCorruption = useVisualCorruptionStore()
const windowManager = useWindowManagerStore()

// Terminal state
const logs = ref([])
const currentLine = ref('')
const isTyping = ref(false)
const cursorVisible = ref(true)
const typingSpeed = 50 // 50ms per character

// Cursor blink interval
let cursorBlinkInterval = null
let autoCloseTimer = null

onMounted(async () => {
  // Start cursor blinking
  cursorBlinkInterval = setInterval(() => {
    cursorVisible.value = !cursorVisible.value
  }, 500)
  
  // Generate and type logs
  await generateAndTypeLogs()
})

onUnmounted(() => {
  // Clean up intervals and timers
  if (cursorBlinkInterval) {
    clearInterval(cursorBlinkInterval)
    cursorBlinkInterval = null
  }
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
    autoCloseTimer = null
  }
  
  // Clear logs array to free memory
  logs.value = []
  currentLine.value = ''
  
  console.log('[TerminalPopup] Cleaned up intervals and freed memory')
})

// Type a single log line character by character
async function typeLog(text) {
  isTyping.value = true
  currentLine.value = ''
  
  // Add command prompt prefix
  const fullLine = `<span class="prompt">C:\\NECRO&gt;</span> ${text}`
  
  for (let i = 0; i < fullLine.length; i++) {
    currentLine.value = fullLine.substring(0, i + 1)
    await delay(typingSpeed)
  }
  
  // Move completed line to logs
  logs.value.push(currentLine.value)
  currentLine.value = ''
  isTyping.value = false
}

// Generate fake system logs with Gemini API
async function generateAndTypeLogs() {
  try {
    const prompt = `Generate 5 fake Windows 95 command prompt log lines. 
Include timestamps in format [YYYY-MM-DD HH:MM:SS], error codes, and references to ghost processes like soul.exe, haunt.dll, entity404.sys, ghost.exe, specter.sys.
Make them look realistic but creepy. Use terms like ERROR, WARNING, CRITICAL, INFO.
Examples:
[2024-11-13 03:33:17] ERROR: Entity 404 detected in memory sector 0x666
[2024-11-13 03:33:18] INFO: Ghost.exe has been resurrected
[2024-11-13 03:33:19] WARNING: soul.exe is consuming 666% CPU
Only respond with the 5 log lines, nothing else. No explanations.`
    
    const response = await geminiService.chat(prompt)
    
    // Parse response into individual lines
    const lines = response
      .split('\n')
      .filter(line => line.trim().length > 0)
      .slice(0, 5) // Take first 5 lines
    
    // Type each log line
    for (const line of lines) {
      await typeLog(parseANSIColors(line))
      await delay(200) // Brief pause between lines
    }
    
  } catch (error) {
    console.error('[TerminalPopup] Failed to generate logs:', error)
    
    // Fallback to predefined logs
    const fallbackLogs = [
      '[2024-11-13 03:33:17] <span class="error">ERROR</span>: Entity 404 detected in memory sector 0x666',
      '[2024-11-13 03:33:18] <span class="info">INFO</span>: Ghost.exe has been resurrected',
      '[2024-11-13 03:33:19] <span class="warning">WARNING</span>: soul.exe is consuming 666% CPU',
      '[2024-11-13 03:33:20] <span class="error">CRITICAL</span>: haunt.dll failed to unload',
      '[2024-11-13 03:33:21] <span class="warning">WARNING</span>: Spectral overflow in sector 13'
    ]
    
    for (const line of fallbackLogs) {
      await typeLog(line)
      await delay(200)
    }
  }
  
  // Auto-close after 10 seconds
  autoCloseTimer = setTimeout(() => {
    closeTerminal()
  }, 10000)
}

// Parse ANSI color codes and apply appropriate styling
function parseANSIColors(text) {
  // Simple ANSI color code support
  // Replace ERROR with red span
  text = text.replace(/ERROR/g, '<span class="error">ERROR</span>')
  text = text.replace(/CRITICAL/g, '<span class="error">CRITICAL</span>')
  
  // Replace WARNING with yellow span
  text = text.replace(/WARNING/g, '<span class="warning">WARNING</span>')
  
  // Replace INFO with cyan span
  text = text.replace(/INFO/g, '<span class="info">INFO</span>')
  
  return text
}

// Close terminal window
function closeTerminal() {
  // Remove from visual corruption store
  visualCorruption.removeTerminalWindow(props.windowId)
  
  // Close window
  windowManager.closeWindow(props.windowId)
}

// Utility delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
</script>

<style scoped>
.terminal-container {
  width: 100%;
  height: 100%;
  background-color: #000000;
  padding: 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.terminal-screen {
  width: 100%;
  height: 100%;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 14px;
  color: #00ff00;
  overflow-y: auto;
  overflow-x: hidden;
  line-height: 1.4;
}

.terminal-line {
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.terminal-cursor {
  display: inline-block;
  background-color: #00ff00;
  color: #000000;
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}

/* Prompt styling */
:deep(.prompt) {
  color: #00ff00;
  font-weight: bold;
}

/* ANSI color support */
:deep(.error) {
  color: #ff0000;
  font-weight: bold;
}

:deep(.warning) {
  color: #ffff00;
  font-weight: bold;
}

:deep(.info) {
  color: #00ffff;
}

/* Scrollbar styling for terminal */
.terminal-screen::-webkit-scrollbar {
  width: 8px;
}

.terminal-screen::-webkit-scrollbar-track {
  background: #000000;
}

.terminal-screen::-webkit-scrollbar-thumb {
  background: #00ff00;
  border-radius: 4px;
}

.terminal-screen::-webkit-scrollbar-thumb:hover {
  background: #00cc00;
}
</style>
