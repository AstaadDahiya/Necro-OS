<template>
  <div class="notepad">
    <div class="menu-bar">
      <button class="btn" @click="showSaveDialog">File</button>
      <button class="btn">Edit</button>
      <button class="btn">Help</button>
    </div>
    <textarea 
      v-model="content" 
      class="notepad-textarea"
      @input="markDirty"
      ref="textareaRef"
    ></textarea>
    <div class="status-bar">
      <span>{{ filename }}{{ isDirty ? '*' : '' }}</span>
    </div>
    
    <!-- Fake Save Dialog -->
    <div v-if="saveDialogVisible" class="save-dialog-overlay" @click="closeSaveDialog">
      <div class="window save-dialog" @click.stop>
        <div class="title-bar">
          <div class="title-bar-text">Save As</div>
          <div class="title-bar-controls">
            <button class="btn-close" @click="closeSaveDialog">×</button>
          </div>
        </div>
        <div class="window-body">
          <div class="field-row">
            <label for="filename">File name:</label>
            <input id="filename" type="text" v-model="saveFilename" />
          </div>
          <div class="field-row" style="justify-content: flex-end; margin-top: 16px;">
            <button class="btn" @click="handleSave">Save</button>
            <button class="btn" @click="closeSaveDialog">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue'
import { useWindowManagerStore } from '../../stores/windowManager'
import { useAdvancedHauntingStore } from '../../stores/advancedHaunting'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const windowManager = useWindowManagerStore()
const advancedHaunting = useAdvancedHauntingStore()

const content = ref('')
const filename = ref('Untitled')
const isDirty = ref(false)
const saveDialogVisible = ref(false)
const saveFilename = ref('document.txt')
const textareaRef = ref(null)
const secretPhraseTriggered = ref(false)

// Initialize with window data if provided
onMounted(() => {
  const window = windowManager.getWindowById(props.windowId)
  if (window && window.data) {
    if (window.data.content) {
      content.value = window.data.content
    }
    if (window.data.filename) {
      filename.value = window.data.filename
      saveFilename.value = window.data.filename
    }
  }
})

const markDirty = async () => {
  isDirty.value = true
  
  // Check for secret phrase "help me"
  if (!secretPhraseTriggered.value) {
    try {
      const { metaHorrorService } = await import('../../utils/metaHorrorService.js')
      
      if (metaHorrorService.checkSecretPhrase(content.value)) {
        console.log('[Notepad] Secret phrase detected!')
        
        secretPhraseTriggered.value = true
        
        // Discover easter egg
        advancedHaunting.discoverEasterEgg('secret_phrase')
        
        // Get current component instance to pass to appendCreepyResponse
        const instance = getCurrentInstance()
        
        // Append creepy response
        await metaHorrorService.appendCreepyResponse(instance.exposed)
      }
    } catch (error) {
      console.error('[Notepad] Failed to check secret phrase:', error)
    }
  }
}

const showSaveDialog = () => {
  saveDialogVisible.value = true
}

const closeSaveDialog = () => {
  saveDialogVisible.value = false
}

const handleSave = () => {
  filename.value = saveFilename.value
  isDirty.value = false
  closeSaveDialog()
}

// AI ghost typing animation
const aiWrite = async (text) => {
  const cursorPosition = textareaRef.value?.selectionStart || content.value.length
  
  for (let i = 0; i < text.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100))
    
    const before = content.value.substring(0, cursorPosition + i)
    const after = content.value.substring(cursorPosition + i)
    content.value = before + text[i] + after
    
    // Update cursor position
    if (textareaRef.value) {
      const newPos = cursorPosition + i + 1
      textareaRef.value.setSelectionRange(newPos, newPos)
      textareaRef.value.focus()
    }
  }
  
  isDirty.value = true
}

// Expose method for ghost behaviors
defineExpose({
  aiWrite
})
</script>

<style scoped>
.notepad {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  font-family: 'MS Sans Serif', sans-serif;
}

.menu-bar {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.menu-bar .btn {
  padding: 2px 8px;
  font-size: 11px;
}

.notepad-textarea {
  flex: 1;
  border: none;
  padding: 8px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  resize: none;
  outline: none;
}

.status-bar {
  padding: 2px 8px;
  background: #c0c0c0;
  border-top: 1px solid #808080;
  font-size: 11px;
}

.save-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.save-dialog {
  width: 400px;
  background: #c0c0c0;
}

.save-dialog .window-body {
  padding: 16px;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.field-row label {
  font-size: 11px;
  min-width: 80px;
}

.field-row input {
  flex: 1;
  padding: 2px 4px;
  font-size: 11px;
}

.field-row button {
  margin-left: 4px;
}

.btn-close {
  background: #c0c0c0;
  border: 1px outset #dfdfdf;
  width: 16px;
  height: 16px;
  font-size: 10px;
  cursor: pointer;
  padding: 0;
}

.btn-close:active {
  border-style: inset;
}
</style>
