<template>
  <div v-if="!isMinimized" class="cursed-clippy" :style="clippyStyle">
    <div class="window" @mousedown="bringToFront">
      <!-- Title Bar -->
      <div class="title-bar" @mousedown.stop="startDrag">
        <div class="title-bar-text">Cursed Clippy</div>
        <div class="title-bar-controls">
          <button aria-label="Minimize" @click="minimize"></button>
          <button aria-label="Close" @click="close"></button>
        </div>
      </div>

      <!-- Window Body -->
      <div class="window-body clippy-body">
        <!-- Messages Container -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message', message.role]"
          >
            <div class="message-content">
              {{ message.content }}
            </div>
            <div class="message-time">
              {{ formatTime(message.timestamp) }}
            </div>
          </div>

          <!-- Typing Indicator -->
          <div v-if="isTyping" class="message assistant typing-indicator">
            <div class="message-content">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
          </div>
        </div>

        <!-- Input Area -->
        <div class="input-area">
          <input 
            type="text" 
            v-model="inputText"
            @keyup.enter="sendMessage"
            placeholder="Type a message..."
            :disabled="isTyping"
            class="input-field"
          />
          <button 
            @click="sendMessage"
            :disabled="isTyping || !inputText.trim()"
            class="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Minimized State (Taskbar Button) -->
  <div v-else class="clippy-minimized">
    <button @click="restore" class="taskbar-button">
      Cursed Clippy
    </button>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick, defineExpose } from 'vue';
import { useCursedAI } from '../stores/cursedAI';

export default {
  name: 'CursedClippy',
  
  setup() {
    const cursedAI = useCursedAI();
    
    // Component state
    const isMinimized = ref(false);
    const inputText = ref('');
    const position = ref({ x: 50, y: 50 });
    const zIndex = ref(1000);
    const isDragging = ref(false);
    const dragOffset = ref({ x: 0, y: 0 });
    const messagesContainer = ref(null);

    // Computed properties
    const messages = computed(() => cursedAI.allMessages);
    const isTyping = computed(() => cursedAI.isTyping);

    const clippyStyle = computed(() => ({
      left: `${position.value.x}px`,
      top: `${position.value.y}px`,
      zIndex: zIndex.value
    }));

    // Methods
    const sendMessage = async () => {
      if (!inputText.value.trim() || isTyping.value) {
        return;
      }

      const message = inputText.value;
      inputText.value = '';

      try {
        await cursedAI.sendMessage(message);
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    };

    const minimize = () => {
      isMinimized.value = true;
    };

    const restore = () => {
      isMinimized.value = false;
      bringToFront();
    };

    const close = () => {
      // For now, just minimize instead of closing completely
      minimize();
    };

    const bringToFront = () => {
      zIndex.value = Date.now();
    };

    const startDrag = (event) => {
      isDragging.value = true;
      dragOffset.value = {
        x: event.clientX - position.value.x,
        y: event.clientY - position.value.y
      };

      document.addEventListener('mousemove', onDrag);
      document.addEventListener('mouseup', endDrag);
    };

    const onDrag = (event) => {
      if (!isDragging.value) return;

      position.value = {
        x: event.clientX - dragOffset.value.x,
        y: event.clientY - dragOffset.value.y
      };
    };

    const endDrag = () => {
      isDragging.value = false;
      document.removeEventListener('mousemove', onDrag);
      document.removeEventListener('mouseup', endDrag);
    };

    const formatTime = (timestamp) => {
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const scrollToBottom = () => {
      nextTick(() => {
        if (messagesContainer.value) {
          messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
        }
      });
    };

    // Autonomous action method (called by ghost behaviors)
    const autonomousAction = async () => {
      const actions = [
        "Still there? I'm watching...",
        "Getting bored? Let me help with that...",
        "You know I can see everything you do, right?",
        "This silence is... uncomfortable.",
        "I've been thinking about your files...",
        "Want to see something cool? No? Too bad.",
        "The void stares back, you know."
      ];

      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      cursedAI.addMessage('assistant', randomAction);
      scrollToBottom();
    };

    // Show message method (called by hooks for commentary)
    const showMessage = (message) => {
      cursedAI.addMessage('assistant', message);
      scrollToBottom();
      // Make sure Clippy is visible
      if (isMinimized.value) {
        restore();
      }
    };

    // Watch for new messages and scroll to bottom
    watch(messages, () => {
      scrollToBottom();
    }, { deep: true });

    // Initial greeting
    if (messages.value.length === 0) {
      cursedAI.addMessage('assistant', "Hello... I'm Cursed Clippy. Looks like you need help with something. Or maybe I need help with you? 😈");
    }

    // Expose methods for parent components
    defineExpose({
      autonomousAction,
      showMessage,
      restore
    });

    return {
      // State
      isMinimized,
      inputText,
      position,
      zIndex,
      messagesContainer,
      
      // Computed
      messages,
      isTyping,
      clippyStyle,
      
      // Methods
      sendMessage,
      minimize,
      restore,
      close,
      bringToFront,
      startDrag,
      formatTime,
      autonomousAction,
      showMessage
    };
  }
};
</script>

<style scoped>
.cursed-clippy {
  position: fixed;
  width: 350px;
  user-select: none;
}

.clippy-body {
  display: flex;
  flex-direction: column;
  height: 400px;
  padding: 8px;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 8px;
  padding: 8px;
  background: white;
  border: 2px inset #dfdfdf;
}

.message {
  margin-bottom: 12px;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-content {
  padding: 8px;
  border-radius: 4px;
  word-wrap: break-word;
  font-size: 13px;
  line-height: 1.4;
}

.message.user .message-content {
  background: #000080;
  color: white;
  margin-left: 20%;
}

.message.assistant .message-content {
  background: #c0c0c0;
  color: black;
  margin-right: 20%;
  border: 2px outset #dfdfdf;
}

.message-time {
  font-size: 10px;
  color: #666;
  margin-top: 4px;
  text-align: right;
}

.message.user .message-time {
  text-align: right;
}

.message.assistant .message-time {
  text-align: left;
}

.typing-indicator .message-content {
  display: flex;
  gap: 4px;
  padding: 12px;
}

.typing-indicator .dot {
  width: 8px;
  height: 8px;
  background: #666;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator .dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator .dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.7;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.input-area {
  display: flex;
  gap: 4px;
}

.input-field {
  flex: 1;
  padding: 4px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 13px;
}

.send-button {
  min-width: 60px;
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.title-bar {
  cursor: move;
}

.clippy-minimized {
  display: none;
}

/* Scrollbar styling for Windows 95 look */
.messages-container::-webkit-scrollbar {
  width: 16px;
}

.messages-container::-webkit-scrollbar-track {
  background: #dfdfdf;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c0c0c0;
  border: 2px outset #dfdfdf;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
</style>
