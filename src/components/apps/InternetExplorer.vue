<template>
  <div class="internet-explorer">
    <div class="toolbar">
      <button class="btn" @click="goBack" :disabled="historyIndex <= 0">← Back</button>
      <button class="btn" @click="goForward" :disabled="historyIndex >= history.length - 1">Forward →</button>
      <button class="btn" @click="refresh">Refresh</button>
      <button class="btn">Stop</button>
      <button class="btn">Home</button>
    </div>
    <div class="address-bar">
      <label>Address:</label>
      <input 
        type="text" 
        v-model="addressInput" 
        @keyup.enter="navigate(addressInput)"
        :disabled="isLoading"
      />
      <button class="btn" @click="navigate(addressInput)" :disabled="isLoading">Go</button>
    </div>
    <div class="content-area">
      <div v-if="isLoading" class="loading">
        <div class="loading-bar">
          <div class="loading-progress" :style="{ width: loadingProgress + '%' }"></div>
        </div>
        <p>Loading {{ currentUrl }}...</p>
      </div>
      <div v-else class="page-content">
        <div v-if="currentUrl === 'about:blank'" class="blank-page">
          <h1>Internet Explorer</h1>
          <p>Welcome to the cursed web.</p>
        </div>
        <div v-else-if="pageContent" v-html="pageContent"></div>
        <div v-else class="error-page">
          <h1>404 - Page Not Found</h1>
          <p>The page {{ currentUrl }} could not be found.</p>
          <p>Perhaps it was consumed by the void...</p>
        </div>
      </div>
    </div>
    <div class="status-bar">
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const currentUrl = ref('about:blank')
const addressInput = ref('about:blank')
const history = ref(['about:blank'])
const historyIndex = ref(0)
const isLoading = ref(false)
const loadingProgress = ref(0)
const pageContent = ref('')

const statusText = computed(() => {
  if (isLoading.value) return 'Loading...'
  return 'Done'
})

// Fake page database
const pages = {
  'about:blank': '',
  'necro-os.com': '<h1>Welcome to Necro-OS</h1><p>The most cursed operating system.</p><img src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'%3E%3Crect fill=\'%23000\' width=\'200\' height=\'200\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' fill=\'%23fff\' text-anchor=\'middle\' dy=\'.3em\'%3E👻%3C/text%3E%3C/svg%3E" />',
  'cursed.net': '<h1>You shouldn\'t be here...</h1><p style="color: red;">Turn back while you still can.</p>',
  'haunted.org': '<h1>HAUNTED WEBSITE</h1><p>This page is watching you.</p><p>👁️ 👁️</p>',
  'help.com': '<h1>Help</h1><p>There is no help here.</p><p>Only darkness.</p>'
}

const navigate = async (url) => {
  if (!url || url === currentUrl.value) return
  
  isLoading.value = true
  loadingProgress.value = 0
  
  // Simulate loading
  const loadInterval = setInterval(() => {
    loadingProgress.value += 10
    if (loadingProgress.value >= 100) {
      clearInterval(loadInterval)
    }
  }, 100)
  
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  currentUrl.value = url
  addressInput.value = url
  pageContent.value = pages[url] || ''
  
  // Update history
  if (historyIndex.value < history.value.length - 1) {
    history.value = history.value.slice(0, historyIndex.value + 1)
  }
  history.value.push(url)
  historyIndex.value = history.value.length - 1
  
  isLoading.value = false
  loadingProgress.value = 0
  
  // Trigger jumpscare hook event
  window.dispatchEvent(new CustomEvent('ie-navigate', { 
    detail: { url } 
  }))
}

const goBack = () => {
  if (historyIndex.value > 0) {
    historyIndex.value--
    const url = history.value[historyIndex.value]
    currentUrl.value = url
    addressInput.value = url
    pageContent.value = pages[url] || ''
  }
}

const goForward = () => {
  if (historyIndex.value < history.value.length - 1) {
    historyIndex.value++
    const url = history.value[historyIndex.value]
    currentUrl.value = url
    addressInput.value = url
    pageContent.value = pages[url] || ''
  }
}

const refresh = () => {
  navigate(currentUrl.value)
}
</script>

<style scoped>
.internet-explorer {
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

.address-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
}

.address-bar label {
  font-size: 11px;
  font-weight: bold;
}

.address-bar input {
  flex: 1;
  padding: 2px 4px;
  font-size: 11px;
  border: 1px inset #dfdfdf;
}

.address-bar .btn {
  padding: 2px 12px;
  font-size: 11px;
}

.content-area {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: white;
}

.loading {
  text-align: center;
  padding: 32px;
}

.loading-bar {
  width: 100%;
  height: 20px;
  background: #c0c0c0;
  border: 1px inset #dfdfdf;
  margin-bottom: 16px;
}

.loading-progress {
  height: 100%;
  background: #000080;
  transition: width 0.1s;
}

.blank-page,
.error-page {
  text-align: center;
  padding: 32px;
}

.blank-page h1,
.error-page h1 {
  font-size: 24px;
  margin-bottom: 16px;
}

.page-content {
  font-size: 12px;
  line-height: 1.6;
}

.page-content h1 {
  font-size: 20px;
  margin-bottom: 12px;
}

.page-content p {
  margin-bottom: 8px;
}

.page-content img {
  max-width: 100%;
  margin: 16px 0;
}

.status-bar {
  padding: 2px 8px;
  background: #c0c0c0;
  border-top: 1px solid #808080;
  font-size: 11px;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
