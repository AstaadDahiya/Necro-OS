<template>
  <div class="soul-scanner">
    <!-- Permission request UI -->
    <div v-if="!hasPermission && !permissionDenied" class="permission-request">
      <div class="permission-icon">📹</div>
      <p>SoulScanner™ requires access to your webcam</p>
      <p class="permission-subtitle">to analyze your eternal essence...</p>
      <button @click="requestPermission" class="permission-button">
        Allow Camera Access
      </button>
    </div>

    <!-- Permission denied UI -->
    <div v-else-if="permissionDenied" class="permission-denied">
      <div class="error-icon">⚠️</div>
      <p>Camera access denied</p>
      <p class="error-message">{{ errorMessage }}</p>
    </div>

    <!-- Webcam feed with 1995 QuickCam aesthetic -->
    <div v-else class="scanner-container">
      <div class="video-container">
        <video
          ref="videoElement"
          class="soul-scanner-video"
          autoplay
          playsinline
        ></video>
        
        <!-- Scanning overlay effect -->
        <div class="scan-line" :class="{ active: isAnalyzing }"></div>
      </div>

      <!-- Caption display area -->
      <div class="caption-area">
        <div class="caption-label">SOUL ANALYSIS:</div>
        <div class="caption-text" :class="{ analyzing: isAnalyzing }">
          {{ currentTaunt || 'Initializing scan...' }}
        </div>
      </div>

      <!-- Status indicator -->
      <div class="status-bar">
        <span class="status-indicator" :class="{ active: isAnalyzing }">●</span>
        <span class="status-text">{{ isAnalyzing ? 'ANALYZING...' : 'MONITORING' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import geminiService from '../../utils/geminiService'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

// Refs
const videoElement = ref(null)
const stream = ref(null)
const captureInterval = ref(null)
const currentTaunt = ref('')
const isAnalyzing = ref(false)
const hasPermission = ref(false)
const permissionDenied = ref(false)
const errorMessage = ref('')

// Request camera permission and start webcam
async function requestPermission() {
  await startWebcam()
}

// Start webcam with MediaDevices API
async function startWebcam() {
  try {
    // Request camera access with 320x240 resolution
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 320 },
        height: { ideal: 240 }
      }
    })

    // Set video element source
    if (videoElement.value) {
      videoElement.value.srcObject = stream.value
    }

    hasPermission.value = true
    permissionDenied.value = false
    currentTaunt.value = 'Scanning your soul...'

    // Start 5-second interval for frame capture
    captureInterval.value = setInterval(() => {
      captureFrame()
    }, 5000)

  } catch (error) {
    console.error('Webcam access error:', error)
    permissionDenied.value = true
    hasPermission.value = false

    // Handle specific error types
    if (error.name === 'NotAllowedError') {
      errorMessage.value = 'Too scared to show your face?'
    } else if (error.name === 'NotFoundError') {
      errorMessage.value = 'No camera detected. You cannot hide forever.'
    } else if (error.name === 'NotReadableError') {
      errorMessage.value = 'Camera is already in use by another application.'
    } else {
      errorMessage.value = 'Something went wrong in the void...'
    }
  }
}

// Capture frame from video using canvas
function captureFrame() {
  if (!videoElement.value || !hasPermission.value) return

  try {
    // Create canvas for frame capture
    const canvas = document.createElement('canvas')
    canvas.width = videoElement.value.videoWidth || 320
    canvas.height = videoElement.value.videoHeight || 240

    const ctx = canvas.getContext('2d')
    ctx.drawImage(videoElement.value, 0, 0, canvas.width, canvas.height)

    // Convert to base64 JPEG
    const imageData = canvas.toDataURL('image/jpeg', 0.7)

    // Analyze the captured frame (will be implemented in subtask 12.3)
    analyzeExpression(imageData)

  } catch (error) {
    console.error('Frame capture error:', error)
  }
}

// Analyze expression using Gemini Vision API
async function analyzeExpression(imageData) {
  isAnalyzing.value = true
  
  try {
    // Call Gemini API with the captured frame
    const response = await geminiService.analyzeImage(imageData)
    
    // Display the AI's cryptic taunt
    currentTaunt.value = response
    
    // Random chance for jumpscare (20% chance)
    if (Math.random() < 0.2) {
      triggerJumpscare()
    }
    
  } catch (error) {
    console.error('Expression analysis error:', error)
    
    // Fallback taunts on error
    const fallbackTaunts = [
      'I cannot see you... yet.',
      'Your soul eludes me... for now.',
      'The darkness obscures your face.',
      'Something blocks my vision...',
      'I sense fear, but cannot see its source.'
    ]
    currentTaunt.value = fallbackTaunts[Math.floor(Math.random() * fallbackTaunts.length)]
  } finally {
    isAnalyzing.value = false
  }
}

// Trigger jumpscare effect
function triggerJumpscare() {
  const video = videoElement.value
  if (!video) return
  
  // Flash red
  video.style.filter = 'grayscale(0%) contrast(300%) brightness(150%) hue-rotate(320deg)'
  video.style.transform = 'scale(1.5)'
  
  // Shake effect
  video.style.animation = 'shake 0.5s'
  
  // Reset after jumpscare
  setTimeout(() => {
    video.style.filter = 'grayscale(100%) contrast(200%) brightness(80%)'
    video.style.transform = 'scale(1.2)'
    video.style.animation = ''
  }, 500)
}

// Stop webcam and cleanup
function stopWebcam() {
  // Clear capture interval
  if (captureInterval.value) {
    clearInterval(captureInterval.value)
    captureInterval.value = null
  }

  // Stop all video tracks
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop())
    stream.value = null
  }

  // Clear video element
  if (videoElement.value) {
    videoElement.value.srcObject = null
  }

  hasPermission.value = false
}

// Lifecycle
onMounted(() => {
  console.log('SoulScanner mounted')
  // Auto-request permission on mount for better UX
  // User can also click the button if auto-request fails
})

onUnmounted(() => {
  console.log('SoulScanner unmounting - cleaning up webcam')
  stopWebcam()
})
</script>

<style scoped>
.soul-scanner {
  width: 100%;
  height: 100%;
  background-color: #000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: 'MS Sans Serif', sans-serif;
  color: #00ff00;
}

/* Permission request UI */
.permission-request,
.permission-denied {
  text-align: center;
  padding: 40px;
  max-width: 400px;
}

.permission-icon,
.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.permission-request p,
.permission-denied p {
  margin: 10px 0;
  font-size: 14px;
  color: #c0c0c0;
}

.permission-subtitle,
.error-message {
  font-size: 12px;
  color: #808080;
  font-style: italic;
}

.permission-button {
  margin-top: 20px;
  padding: 8px 16px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  cursor: pointer;
}

/* Scanner container */
.scanner-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  box-sizing: border-box;
}

/* Video container with 1995 QuickCam aesthetic */
.video-container {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #000;
  border: 2px solid #00ff00;
  margin-bottom: 15px;
  overflow: hidden;
}

.soul-scanner-video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  
  /* 1995 QuickCam aesthetic filters */
  filter: grayscale(100%) contrast(200%) brightness(80%);
  image-rendering: pixelated;
  transform: scale(1.2);
}

/* Scanning line effect */
.scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to bottom, transparent, #00ff00, transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.scan-line.active {
  opacity: 0.8;
  animation: scan 2s linear infinite;
}

@keyframes scan {
  0% {
    top: 0;
  }
  100% {
    top: 100%;
  }
}

/* Caption area */
.caption-area {
  background-color: #1a1a1a;
  border: 2px solid #00ff00;
  padding: 15px;
  min-height: 80px;
  margin-bottom: 10px;
}

.caption-label {
  font-size: 10px;
  color: #00ff00;
  margin-bottom: 8px;
  letter-spacing: 2px;
}

.caption-text {
  font-size: 13px;
  color: #c0c0c0;
  line-height: 1.4;
  min-height: 40px;
}

.caption-text.analyzing {
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Status bar */
.status-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #808080;
}

.status-indicator {
  font-size: 8px;
  color: #00ff00;
  opacity: 0.5;
}

.status-indicator.active {
  opacity: 1;
  animation: blink 1s step-start infinite;
}

@keyframes blink {
  50% {
    opacity: 0.3;
  }
}

.status-text {
  letter-spacing: 1px;
}

/* Jumpscare shake animation */
@keyframes shake {
  0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1.5); }
  10% { transform: translate(-10px, -10px) rotate(-2deg) scale(1.5); }
  20% { transform: translate(10px, 10px) rotate(2deg) scale(1.5); }
  30% { transform: translate(-10px, 10px) rotate(-1deg) scale(1.5); }
  40% { transform: translate(10px, -10px) rotate(1deg) scale(1.5); }
  50% { transform: translate(-10px, -10px) rotate(-2deg) scale(1.5); }
  60% { transform: translate(10px, 10px) rotate(2deg) scale(1.5); }
  70% { transform: translate(-10px, 10px) rotate(-1deg) scale(1.5); }
  80% { transform: translate(10px, -10px) rotate(1deg) scale(1.5); }
  90% { transform: translate(-5px, 5px) rotate(-0.5deg) scale(1.5); }
}
</style>
