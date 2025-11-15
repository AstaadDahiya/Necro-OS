<template>
  <div v-if="showWarning" class="photosensitivity-warning-overlay" role="dialog" aria-labelledby="warning-title" aria-describedby="warning-description">
    <div class="warning-dialog">
      <div class="warning-header">
        <h2 id="warning-title">⚠️ Photosensitivity Warning</h2>
      </div>
      
      <div class="warning-content">
        <p id="warning-description" class="warning-text">
          <strong>This experience contains:</strong>
        </p>
        <ul class="warning-list">
          <li>Flashing lights and rapid visual changes</li>
          <li>Screen glitches and distortions</li>
          <li>Sudden bright flashes</li>
          <li>Rapid color inversions</li>
          <li>Jumpscares with visual and audio effects</li>
        </ul>
        
        <p class="warning-text">
          <strong>These effects may trigger seizures in people with photosensitive epilepsy.</strong>
        </p>
        
        <p class="warning-text">
          If you or anyone in your family has an epileptic condition or has experienced seizures, 
          please consult a doctor before playing.
        </p>
        
        <div class="accessibility-options">
          <label class="option-checkbox">
            <input 
              type="checkbox" 
              v-model="enableReducedMotion"
              @change="handleReducedMotionChange"
              aria-label="Enable reduced motion mode to minimize visual effects"
            />
            <span>Enable Reduced Motion Mode (recommended for photosensitivity)</span>
          </label>
          
          <p class="option-description">
            Reduced Motion Mode will minimize flashing, reduce animation speeds, 
            and disable rapid visual changes.
          </p>
        </div>
      </div>
      
      <div class="warning-actions">
        <button 
          @click="acceptWarning" 
          class="accept-button"
          aria-label="I understand the risks and wish to continue"
          autofocus
        >
          I Understand - Continue
        </button>
        <button 
          @click="exitApplication" 
          class="exit-button"
          aria-label="Exit the application"
        >
          Exit
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'

const advancedHaunting = useAdvancedHauntingStore()

const showWarning = ref(false)
const enableReducedMotion = ref(false)

// Check if warning has been shown before
const checkWarningStatus = () => {
  try {
    const warningShown = localStorage.getItem('necro-os-photosensitivity-warning-shown')
    if (!warningShown) {
      showWarning.value = true
    }
  } catch (error) {
    console.error('[PhotosensitivityWarning] Failed to check warning status:', error)
    // Show warning by default if localStorage fails
    showWarning.value = true
  }
}

const handleReducedMotionChange = () => {
  console.log('[PhotosensitivityWarning] Reduced motion toggled:', enableReducedMotion.value)
}

const acceptWarning = () => {
  try {
    // Save that warning has been shown
    localStorage.setItem('necro-os-photosensitivity-warning-shown', 'true')
    
    // Apply reduced motion if enabled
    if (enableReducedMotion.value) {
      advancedHaunting.updateCustomization({
        ...advancedHaunting.customization,
        reducedMotion: true
      })
      
      // Add reduced motion class to body
      document.body.classList.add('reduced-motion')
      
      console.log('[PhotosensitivityWarning] Reduced motion mode enabled')
    }
    
    showWarning.value = false
    
    console.log('[PhotosensitivityWarning] Warning accepted')
  } catch (error) {
    console.error('[PhotosensitivityWarning] Failed to save warning status:', error)
    // Continue anyway
    showWarning.value = false
  }
}

const exitApplication = () => {
  // Close the window/tab
  window.close()
  
  // If window.close() doesn't work (some browsers block it), show a message
  setTimeout(() => {
    if (!window.closed) {
      alert('Please close this tab/window to exit.')
    }
  }, 100)
}

onMounted(() => {
  checkWarningStatus()
  
  // Check for prefers-reduced-motion system preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    enableReducedMotion.value = true
    console.log('[PhotosensitivityWarning] System prefers reduced motion detected')
  }
})
</script>

<style scoped>
.photosensitivity-warning-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  font-family: 'MS Sans Serif', sans-serif;
}

.warning-dialog {
  background-color: #c0c0c0;
  border: 3px solid;
  border-color: #fff #000 #000 #fff;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.5);
}

.warning-header {
  background: linear-gradient(to right, #000080, #1084d0);
  color: white;
  padding: 4px 8px;
  font-weight: bold;
  font-size: 11px;
  border-bottom: 2px solid #000;
}

.warning-header h2 {
  margin: 0;
  font-size: 13px;
  font-weight: bold;
}

.warning-content {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
  background-color: #c0c0c0;
}

.warning-text {
  font-size: 12px;
  line-height: 1.6;
  margin: 0 0 12px 0;
  color: #000;
}

.warning-text strong {
  color: #c00;
  font-weight: bold;
}

.warning-list {
  margin: 12px 0 12px 20px;
  padding: 0;
  font-size: 11px;
  line-height: 1.8;
}

.warning-list li {
  margin-bottom: 6px;
  color: #000;
}

.accessibility-options {
  margin-top: 20px;
  padding: 12px;
  background-color: #fff;
  border: 2px solid #808080;
  border-top-color: #000;
  border-left-color: #000;
}

.option-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 11px;
  font-weight: bold;
  cursor: pointer;
  user-select: none;
  margin-bottom: 8px;
}

.option-checkbox input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
}

.option-description {
  font-size: 10px;
  color: #666;
  margin: 0;
  font-style: italic;
  line-height: 1.4;
}

.warning-actions {
  padding: 12px;
  background-color: #c0c0c0;
  border-top: 2px solid #808080;
  display: flex;
  gap: 8px;
  justify-content: center;
}

.warning-actions button {
  padding: 8px 24px;
  font-size: 11px;
  font-weight: bold;
  font-family: 'MS Sans Serif', sans-serif;
  border: 2px solid;
  cursor: pointer;
  user-select: none;
  min-width: 120px;
}

.accept-button {
  background-color: #008000;
  border-color: #0f0 #004000 #004000 #0f0;
  color: #fff;
}

.accept-button:hover {
  background-color: #009000;
}

.accept-button:active {
  border-color: #004000 #0f0 #0f0 #004000;
  padding: 9px 23px 7px 25px;
}

.accept-button:focus {
  outline: 2px dotted #000;
  outline-offset: 2px;
}

.exit-button {
  background-color: #c0c0c0;
  border-color: #fff #000 #000 #fff;
  color: #000;
}

.exit-button:hover {
  background-color: #d0d0d0;
}

.exit-button:active {
  border-color: #000 #fff #fff #000;
  padding: 9px 23px 7px 25px;
}

.exit-button:focus {
  outline: 2px dotted #000;
  outline-offset: 2px;
}

/* Scrollbar styling */
.warning-content::-webkit-scrollbar {
  width: 16px;
}

.warning-content::-webkit-scrollbar-track {
  background: #c0c0c0;
}

.warning-content::-webkit-scrollbar-thumb {
  background: #808080;
  border: 2px solid;
  border-color: #fff #000 #000 #fff;
}

.warning-content::-webkit-scrollbar-thumb:hover {
  background: #606060;
}
</style>
