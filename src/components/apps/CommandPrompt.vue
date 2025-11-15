<template>
  <div class="command-prompt" @click="focusInput">
    <div class="terminal-output" ref="outputRef">
      <div class="terminal-header">
        Microsoft(R) Windows 98<br>
        (C)Copyright Microsoft Corp 1981-1998.<br>
        <br>
      </div>
      
      <div 
        v-for="(line, index) in outputLines" 
        :key="index"
        class="output-line"
        :class="{ 'autonomous-line': line.isAutonomous, 'error-line': line.isError }"
      >
        <span v-if="line.isCommand" class="prompt">C:\&gt; </span>
        <span v-html="line.text"></span>
      </div>
      
      <!-- Current input line -->
      <div class="input-line">
        <span class="prompt">C:\&gt; </span>
        <span class="input-text">{{ currentInput }}</span>
        <span class="cursor" :class="{ 'cursor-blink': !isTyping }">_</span>
      </div>
    </div>
    
    <!-- Hidden input for keyboard capture -->
    <input
      ref="hiddenInputRef"
      type="text"
      class="hidden-input"
      v-model="currentInput"
      @keydown.enter="handleEnter"
      @keydown.up="handleUpArrow"
      @keydown.down="handleDownArrow"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useAdvancedHauntingStore } from '../../stores/advancedHaunting'
import { 
  shouldTypeAutonomously, 
  getAutonomousMessage, 
  typeMessage 
} from '../../utils/possessedAppsService'

export default {
  name: 'CommandPrompt',
  
  setup() {
    const advancedHaunting = useAdvancedHauntingStore()
    
    // Refs
    const outputRef = ref(null)
    const hiddenInputRef = ref(null)
    
    // State
    const outputLines = ref([])
    const currentInput = ref('')
    const commandHistory = ref([])
    const historyIndex = ref(-1)
    const isTyping = ref(false)
    const autonomousTypingCleanup = ref(null)
    const autonomousTypingInterval = ref(null)
    
    // Get current possession level
    const possessionLevel = computed(() => advancedHaunting.currentPossessionLevel)
    
    // Available commands
    const commands = {
      help: () => {
        return [
          'Available commands:',
          '  HELP    - Display this help message',
          '  DIR     - List directory contents',
          '  CLS     - Clear the screen',
          '  VER     - Display version information',
          '  TIME    - Display current time',
          '  DATE    - Display current date',
          '  EXIT    - Close this window'
        ]
      },
      dir: () => {
        return [
          ' Volume in drive C is CURSED',
          ' Volume Serial Number is 0666-DEAD',
          '',
          ' Directory of C:\\',
          '',
          '10/31/1998  03:33 AM    <DIR>          WINDOWS',
          '10/31/1998  03:33 AM    <DIR>          SOULS',
          '06/06/2006  06:66 PM         1,666     CURSED.EXE',
          '13/13/2013  01:13 AM        13,666     YOUR_SOUL.DAT',
          '               2 File(s)     15,332 bytes',
          '               2 Dir(s)   666,666,666 bytes free'
        ]
      },
      cls: () => {
        outputLines.value = []
        return null
      },
      ver: () => {
        return ['NecroOS Version 6.66.666']
      },
      time: () => {
        const now = new Date()
        const timeStr = now.toLocaleTimeString()
        return [`The current time is: ${timeStr}`]
      },
      date: () => {
        const now = new Date()
        const dateStr = now.toLocaleDateString()
        return [`The current date is: ${dateStr}`]
      },
      exit: () => {
        // This would close the window - handled by parent
        return ['Closing...']
      }
    }
    
    // Add output line
    function addOutputLine(text, options = {}) {
      outputLines.value.push({
        text,
        isCommand: options.isCommand || false,
        isAutonomous: options.isAutonomous || false,
        isError: options.isError || false
      })
      
      // Scroll to bottom
      nextTick(() => {
        if (outputRef.value) {
          outputRef.value.scrollTop = outputRef.value.scrollHeight
        }
      })
    }
    
    // Execute command
    function executeCommand(cmd) {
      const trimmedCmd = cmd.trim().toLowerCase()
      
      // Add command to output
      addOutputLine(cmd, { isCommand: true })
      
      // Add to history
      if (trimmedCmd) {
        commandHistory.value.push(cmd)
        historyIndex.value = commandHistory.value.length
      }
      
      // Execute command
      if (trimmedCmd === '') {
        // Empty command, just show prompt
        return
      }
      
      const commandFunc = commands[trimmedCmd]
      if (commandFunc) {
        const result = commandFunc()
        if (result) {
          result.forEach(line => addOutputLine(line))
        }
      } else {
        addOutputLine(`Bad command or file name: ${trimmedCmd}`, { isError: true })
      }
    }
    
    // Handle enter key
    function handleEnter(event) {
      event.preventDefault()
      
      if (isTyping.value) {
        // Don't allow input while autonomous typing
        return
      }
      
      const cmd = currentInput.value
      currentInput.value = ''
      
      executeCommand(cmd)
    }
    
    // Handle up arrow (command history)
    function handleUpArrow(event) {
      event.preventDefault()
      
      if (commandHistory.value.length === 0) return
      
      if (historyIndex.value > 0) {
        historyIndex.value--
        currentInput.value = commandHistory.value[historyIndex.value]
      }
    }
    
    // Handle down arrow (command history)
    function handleDownArrow(event) {
      event.preventDefault()
      
      if (commandHistory.value.length === 0) return
      
      if (historyIndex.value < commandHistory.value.length - 1) {
        historyIndex.value++
        currentInput.value = commandHistory.value[historyIndex.value]
      } else {
        historyIndex.value = commandHistory.value.length
        currentInput.value = ''
      }
    }
    
    // Focus the hidden input
    function focusInput() {
      if (hiddenInputRef.value) {
        hiddenInputRef.value.focus()
      }
    }
    
    // Start autonomous typing
    function startAutonomousTyping() {
      if (isTyping.value || !shouldTypeAutonomously(possessionLevel.value)) {
        return
      }
      
      isTyping.value = true
      const message = getAutonomousMessage()
      
      // Clear current input
      currentInput.value = ''
      
      // Type the message
      autonomousTypingCleanup.value = typeMessage(
        message,
        (char) => {
          // Add character to current input
          currentInput.value += char
        },
        () => {
          // Typing complete
          isTyping.value = false
          
          // Add to output as autonomous message
          addOutputLine(currentInput.value, { isAutonomous: true })
          currentInput.value = ''
          
          // Schedule next autonomous typing
          scheduleAutonomousTyping()
        }
      )
    }
    
    // Schedule next autonomous typing
    function scheduleAutonomousTyping() {
      if (!shouldTypeAutonomously(possessionLevel.value)) {
        return
      }
      
      // Random interval between 10-30 seconds
      const delay = (Math.random() * 20000) + 10000
      
      autonomousTypingInterval.value = setTimeout(() => {
        startAutonomousTyping()
      }, delay)
    }
    
    // Lifecycle
    onMounted(() => {
      // Focus input on mount
      focusInput()
      
      // Start autonomous typing if possession level is high enough
      if (shouldTypeAutonomously(possessionLevel.value)) {
        scheduleAutonomousTyping()
      }
    })
    
    onUnmounted(() => {
      // Cleanup autonomous typing
      if (autonomousTypingCleanup.value) {
        autonomousTypingCleanup.value()
      }
      if (autonomousTypingInterval.value) {
        clearTimeout(autonomousTypingInterval.value)
      }
    })
    
    return {
      outputRef,
      hiddenInputRef,
      outputLines,
      currentInput,
      isTyping,
      handleEnter,
      handleUpArrow,
      handleDownArrow,
      focusInput
    }
  }
}
</script>

<style scoped>
.command-prompt {
  width: 100%;
  height: 100%;
  background: #000;
  color: #c0c0c0;
  font-family: 'Courier New', 'Consolas', monospace;
  font-size: 14px;
  padding: 8px;
  overflow: hidden;
  cursor: text;
  position: relative;
}

.terminal-output {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.terminal-header {
  color: #c0c0c0;
  margin-bottom: 8px;
}

.output-line {
  margin: 2px 0;
  line-height: 1.4;
}

.prompt {
  color: #fff;
  font-weight: bold;
}

.input-line {
  display: inline-block;
  margin: 2px 0;
}

.input-text {
  color: #fff;
}

.cursor {
  color: #fff;
  font-weight: bold;
  animation: none;
}

.cursor-blink {
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

.autonomous-line {
  color: #ff0000;
  font-weight: bold;
  text-shadow: 0 0 5px #ff0000;
  animation: flicker 0.3s ease-in-out;
}

@keyframes flicker {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.error-line {
  color: #ff6666;
}

.hidden-input {
  position: absolute;
  left: -9999px;
  opacity: 0;
}

/* Scrollbar styling */
.terminal-output::-webkit-scrollbar {
  width: 16px;
}

.terminal-output::-webkit-scrollbar-track {
  background: #000;
}

.terminal-output::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border: 2px solid #000;
}

.terminal-output::-webkit-scrollbar-thumb:hover {
  background: #fff;
}
</style>
