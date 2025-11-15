<template>
  <div class="recycle-bin">
    <div class="toolbar">
      <button class="btn" @click="emptyBin" :disabled="deletedFiles.length === 0">Empty Recycle Bin</button>
      <button class="btn" @click="restoreSelected" :disabled="!selectedFile">Restore</button>
      <button class="btn" @click="permanentDeleteSelected" :disabled="!selectedFile">Delete</button>
    </div>
    <div class="file-list">
      <div v-if="deletedFiles.length === 0" class="empty-message">
        <p>🗑️</p>
        <p>Recycle Bin is empty</p>
      </div>
      <div v-else class="files">
        <div 
          v-for="file in deletedFiles" 
          :key="file.id"
          class="file-item"
          :class="{ selected: selectedFile?.id === file.id }"
          @click="selectFile(file)"
          @dblclick="restoreFile(file)"
        >
          <div class="file-icon">📄</div>
          <div class="file-info">
            <div class="file-name">{{ file.name }}</div>
            <div class="file-details">
              <span>Original location: {{ file.path }}</span>
              <span>Deleted: {{ formatDate(file.deletedAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="status-bar">
      <span>{{ deletedFiles.length }} item(s)</span>
    </div>
    
    <!-- Confirmation Dialog -->
    <div v-if="confirmDialogVisible" class="dialog-overlay" @click="closeConfirmDialog">
      <div class="window confirm-dialog" @click.stop>
        <div class="title-bar">
          <div class="title-bar-text">Confirm</div>
          <div class="title-bar-controls">
            <button class="btn-close" @click="closeConfirmDialog">×</button>
          </div>
        </div>
        <div class="window-body">
          <p>{{ confirmMessage }}</p>
          <div class="button-row">
            <button class="btn" @click="confirmAction">Yes</button>
            <button class="btn" @click="closeConfirmDialog">No</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const deletedFiles = ref([])
const selectedFile = ref(null)
const confirmDialogVisible = ref(false)
const confirmMessage = ref('')
const pendingAction = ref(null)

const selectFile = (file) => {
  selectedFile.value = file
}

const restoreFile = (file) => {
  const index = deletedFiles.value.findIndex(f => f.id === file.id)
  if (index !== -1) {
    deletedFiles.value.splice(index, 1)
    selectedFile.value = null
    
    // Emit event for file restoration
    window.dispatchEvent(new CustomEvent('file-restored', { 
      detail: { file } 
    }))
  }
}

const restoreSelected = () => {
  if (selectedFile.value) {
    restoreFile(selectedFile.value)
  }
}

const permanentDeleteFile = (file) => {
  const index = deletedFiles.value.findIndex(f => f.id === file.id)
  if (index !== -1) {
    deletedFiles.value.splice(index, 1)
    selectedFile.value = null
    
    // Emit event for permanent deletion (triggers ghost commentary)
    window.dispatchEvent(new CustomEvent('file-permanently-deleted', { 
      detail: { file } 
    }))
  }
}

const permanentDeleteSelected = () => {
  if (selectedFile.value) {
    confirmMessage.value = `Are you sure you want to permanently delete "${selectedFile.value.name}"?`
    pendingAction.value = () => permanentDeleteFile(selectedFile.value)
    confirmDialogVisible.value = true
  }
}

const emptyBin = () => {
  if (deletedFiles.value.length > 0) {
    confirmMessage.value = `Are you sure you want to permanently delete all ${deletedFiles.value.length} item(s)?`
    pendingAction.value = () => {
      deletedFiles.value = []
      selectedFile.value = null
      
      window.dispatchEvent(new CustomEvent('recycle-bin-emptied'))
    }
    confirmDialogVisible.value = true
  }
}

const closeConfirmDialog = () => {
  confirmDialogVisible.value = false
  pendingAction.value = null
}

const confirmAction = () => {
  if (pendingAction.value) {
    pendingAction.value()
  }
  closeConfirmDialog()
}

const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// Listen for file deletion events
const handleFileDeleted = (event) => {
  const { path, name } = event.detail
  deletedFiles.value.push({
    id: Date.now() + Math.random(),
    name: name,
    path: path,
    deletedAt: Date.now()
  })
}

onMounted(() => {
  window.addEventListener('file-deleted', handleFileDeleted)
})

onUnmounted(() => {
  window.removeEventListener('file-deleted', handleFileDeleted)
})
</script>

<style scoped>
.recycle-bin {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: white;
  font-family: 'MS Sans Serif', sans-serif;
}

.toolbar {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.toolbar .btn {
  padding: 2px 8px;
  font-size: 11px;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.empty-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #808080;
  font-size: 14px;
}

.empty-message p:first-child {
  font-size: 48px;
  margin-bottom: 8px;
}

.files {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 4px;
  cursor: pointer;
  border: 1px solid transparent;
}

.file-item:hover {
  background: #e0e0e0;
}

.file-item.selected {
  background: #000080;
  color: white;
}

.file-icon {
  font-size: 24px;
  margin-right: 8px;
}

.file-info {
  flex: 1;
}

.file-name {
  font-size: 11px;
  font-weight: bold;
  margin-bottom: 2px;
}

.file-details {
  display: flex;
  flex-direction: column;
  font-size: 10px;
  opacity: 0.8;
}

.status-bar {
  padding: 2px 8px;
  background: #c0c0c0;
  border-top: 1px solid #808080;
  font-size: 11px;
}

.dialog-overlay {
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

.confirm-dialog {
  width: 350px;
  background: #c0c0c0;
}

.confirm-dialog .window-body {
  padding: 16px;
}

.confirm-dialog p {
  font-size: 11px;
  margin-bottom: 16px;
}

.button-row {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
