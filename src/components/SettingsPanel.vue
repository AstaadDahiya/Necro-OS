<template>
  <div class="settings-panel">
    <div class="settings-header">
      <h2>⚙️ Settings</h2>
    </div>

    <div class="settings-content">
      <!-- Scare Intensity Section -->
      <div class="settings-section">
        <h3>Scare Intensity</h3>
        <div class="slider-container">
          <label>
            <span>Jumpscare Frequency: {{ customization.scareIntensity }}%</span>
            <input
              type="range"
              min="0"
              max="100"
              v-model.number="customization.scareIntensity"
              @input="handleCustomizationChange"
              class="intensity-slider"
              aria-label="Scare intensity slider"
              :aria-valuenow="customization.scareIntensity"
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </label>
          <p class="setting-description">
            Controls how often jumpscares and intense horror events occur
          </p>
        </div>
      </div>

      <!-- Feature Toggles Section -->
      <div class="settings-section">
        <h3>Horror Features</h3>
        <div class="toggles-container">
          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="customization.enabledBehaviors.has('possessedApps')"
              @change="toggleBehavior('possessedApps')"
              aria-label="Enable possessed apps behavior"
            />
            <span>Possessed Apps</span>
          </label>
          <p class="setting-description">
            Applications behave strangely and display disturbing content
          </p>

          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="customization.enabledBehaviors.has('audioHaunting')"
              @change="toggleBehavior('audioHaunting')"
              aria-label="Enable audio haunting effects"
            />
            <span>Audio Haunting</span>
          </label>
          <p class="setting-description">
            Ambient sounds, whispers, and tension-building audio effects
          </p>

          <label class="toggle-item">
            <input
              type="checkbox"
              :checked="customization.enabledBehaviors.has('visualCorruption')"
              @change="toggleBehavior('visualCorruption')"
              aria-label="Enable visual corruption effects"
            />
            <span>Visual Corruption</span>
          </label>
          <p class="setting-description">
            Screen glitches, distortions, and visual anomalies
          </p>
        </div>
      </div>

      <!-- Theme Selector Section -->
      <div class="settings-section">
        <h3>Theme</h3>
        <div class="theme-selector">
          <label
            v-for="theme in themes"
            :key="theme.value"
            class="theme-option"
            :class="{ active: customization.theme === theme.value }"
          >
            <input
              type="radio"
              name="theme"
              :value="theme.value"
              v-model="customization.theme"
              @change="handleCustomizationChange"
              :aria-label="`Select ${theme.name} theme`"
            />
            <span class="theme-icon" aria-hidden="true">{{ theme.icon }}</span>
            <span class="theme-name">{{ theme.name }}</span>
          </label>
        </div>
      </div>

      <!-- Accessibility Section -->
      <div class="settings-section">
        <h3>♿ Accessibility</h3>
        <div class="toggles-container">
          <label class="toggle-item">
            <input
              type="checkbox"
              v-model="customization.reducedMotion"
              @change="handleCustomizationChange"
              aria-label="Enable reduced motion mode to minimize flashing and rapid animations"
            />
            <span>Reduced Motion Mode</span>
          </label>
          <p class="setting-description">
            Minimizes flashing, reduces animation speeds, and disables rapid visual changes (recommended for photosensitivity)
          </p>

          <label class="toggle-item">
            <input
              type="checkbox"
              v-model="customization.visualCuesForAudio"
              @change="handleCustomizationChange"
              aria-label="Show visual indicators for audio events"
            />
            <span>Visual Cues for Audio</span>
          </label>
          <p class="setting-description">
            Shows visual indicators when audio events occur (helpful for hearing impaired users)
          </p>
        </div>
      </div>

      <!-- Statistics Section -->
      <div class="settings-section">
        <h3>Statistics</h3>
        <div class="statistics-grid">
          <div class="stat-item">
            <span class="stat-label">Total Sessions:</span>
            <span class="stat-value">{{ statistics.totalSessions }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Time Survived:</span>
            <span class="stat-value">{{ statistics.totalTimeSurvivedFormatted }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Current Possession:</span>
            <span class="stat-value">{{ statistics.currentPossessionLevel }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Max Possession:</span>
            <span class="stat-value">{{ statistics.maxPossessionReached }}%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Exorcisms:</span>
            <span class="stat-value">{{ statistics.exorcismsPerformed }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Jumpscares Seen:</span>
            <span class="stat-value">{{ statistics.jumpscaresSeen }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Achievements:</span>
            <span class="stat-value">{{ statistics.achievementsUnlocked }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Easter Eggs:</span>
            <span class="stat-value">{{ statistics.easterEggsFound }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Difficulty:</span>
            <span class="stat-value">{{ statistics.difficulty }}</span>
          </div>
          <div class="stat-item" v-if="statistics.endingsReached.length > 0">
            <span class="stat-label">Endings:</span>
            <span class="stat-value">{{ statistics.endingsReached.join(', ') }}</span>
          </div>
        </div>
      </div>

      <!-- Reset Progress Section -->
      <div class="settings-section">
        <h3>Danger Zone</h3>
        <button
          class="reset-button"
          @click="showResetConfirmation = true"
          :disabled="showResetConfirmation"
          aria-label="Reset all progress and statistics"
        >
          🗑️ Reset All Progress
        </button>
        <p class="setting-description warning">
          This will permanently delete all saved data, statistics, and achievements
        </p>

        <!-- Reset Confirmation Dialog -->
        <div v-if="showResetConfirmation" class="confirmation-dialog">
          <p>Are you sure you want to reset all progress?</p>
          <p class="warning-text">This action cannot be undone!</p>
          <div class="confirmation-buttons">
            <button @click="confirmReset" class="confirm-yes" aria-label="Confirm reset all progress">Yes, Reset</button>
            <button @click="showResetConfirmation = false" class="confirm-no" aria-label="Cancel reset">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useAdvancedHauntingStore } from '../stores/advancedHaunting'

const advancedHaunting = useAdvancedHauntingStore()

// Local reactive state for customization
const customization = reactive({
  scareIntensity: advancedHaunting.customization.scareIntensity,
  enabledBehaviors: new Set(advancedHaunting.customization.enabledBehaviors),
  theme: advancedHaunting.customization.theme,
  reducedMotion: advancedHaunting.customization.reducedMotion,
  visualCuesForAudio: advancedHaunting.customization.visualCuesForAudio
})

// Theme options
const themes = [
  { value: 'default', name: 'Default', icon: '🖥️' },
  { value: 'hospital', name: 'Hospital', icon: '🏥' },
  { value: 'asylum', name: 'Asylum', icon: '🏚️' },
  { value: 'cemetery', name: 'Cemetery', icon: '⚰️' }
]

// Statistics
const statistics = computed(() => advancedHaunting.getStatistics())

// Reset confirmation state
const showResetConfirmation = ref(false)

// Handle customization changes
function handleCustomizationChange() {
  advancedHaunting.updateCustomization({
    scareIntensity: customization.scareIntensity,
    enabledBehaviors: Array.from(customization.enabledBehaviors),
    theme: customization.theme,
    reducedMotion: customization.reducedMotion,
    visualCuesForAudio: customization.visualCuesForAudio
  })
}

// Toggle behavior
function toggleBehavior(behaviorType) {
  if (customization.enabledBehaviors.has(behaviorType)) {
    customization.enabledBehaviors.delete(behaviorType)
  } else {
    customization.enabledBehaviors.add(behaviorType)
  }
  handleCustomizationChange()
}

// Confirm reset
function confirmReset() {
  advancedHaunting.clearProgress()
  showResetConfirmation.value = false
  
  // Reload customization from store (now reset to defaults)
  customization.scareIntensity = advancedHaunting.customization.scareIntensity
  customization.enabledBehaviors = new Set(advancedHaunting.customization.enabledBehaviors)
  customization.theme = advancedHaunting.customization.theme
  customization.reducedMotion = advancedHaunting.customization.reducedMotion
  customization.visualCuesForAudio = advancedHaunting.customization.visualCuesForAudio
  
  // Show notification
  alert('All progress has been reset!')
}

// Initialize
onMounted(() => {
  console.log('[SettingsPanel] Settings panel mounted')
})
</script>

<style scoped>
.settings-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
  overflow: hidden;
}

.settings-header {
  background: linear-gradient(to right, #000080, #1084d0);
  color: white;
  padding: 4px 8px;
  font-weight: bold;
  font-size: 11px;
  border-bottom: 2px solid #000;
}

.settings-header h2 {
  margin: 0;
  font-size: 11px;
  font-weight: bold;
}

.settings-content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.settings-section {
  background-color: #fff;
  border: 2px solid #808080;
  border-top-color: #000;
  border-left-color: #000;
  padding: 12px;
  margin-bottom: 16px;
}

.settings-section h3 {
  margin: 0 0 12px 0;
  font-size: 12px;
  font-weight: bold;
  color: #000080;
  border-bottom: 1px solid #808080;
  padding-bottom: 4px;
}

/* Slider Section */
.slider-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-container label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-container label span {
  font-size: 11px;
  font-weight: bold;
}

.intensity-slider {
  width: 100%;
  height: 20px;
  cursor: pointer;
}

.setting-description {
  font-size: 10px;
  color: #666;
  margin: 4px 0 0 0;
  font-style: italic;
}

.setting-description.warning {
  color: #c00;
  font-weight: bold;
}

/* Toggles Section */
.toggles-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  cursor: pointer;
  user-select: none;
}

.toggle-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.toggle-item span {
  font-weight: bold;
}

/* Theme Selector */
.theme-selector {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 2px solid #808080;
  background-color: #c0c0c0;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s;
}

.theme-option:hover {
  background-color: #d0d0d0;
}

.theme-option.active {
  border-color: #000080;
  background-color: #e0e0ff;
  box-shadow: inset 0 0 0 1px #000080;
}

.theme-option input[type="radio"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.theme-icon {
  font-size: 16px;
}

.theme-name {
  font-size: 11px;
  font-weight: bold;
}

/* Statistics Grid */
.statistics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
  background-color: #f0f0f0;
  border: 1px solid #808080;
  font-size: 10px;
}

.stat-label {
  font-weight: bold;
  color: #000;
}

.stat-value {
  color: #000080;
  font-weight: bold;
}

/* Reset Button */
.reset-button {
  width: 100%;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: bold;
  font-family: 'MS Sans Serif', sans-serif;
  background-color: #c0c0c0;
  border: 2px solid;
  border-color: #fff #000 #000 #fff;
  cursor: pointer;
  user-select: none;
}

.reset-button:hover:not(:disabled) {
  background-color: #d0d0d0;
}

.reset-button:active:not(:disabled) {
  border-color: #000 #fff #fff #000;
  padding: 9px 15px 7px 17px;
}

.reset-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Confirmation Dialog */
.confirmation-dialog {
  margin-top: 12px;
  padding: 12px;
  background-color: #fffacd;
  border: 2px solid #ff0000;
}

.confirmation-dialog p {
  margin: 0 0 8px 0;
  font-size: 11px;
  font-weight: bold;
}

.warning-text {
  color: #c00;
  font-size: 10px !important;
}

.confirmation-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.confirmation-buttons button {
  flex: 1;
  padding: 6px 12px;
  font-size: 11px;
  font-weight: bold;
  font-family: 'MS Sans Serif', sans-serif;
  border: 2px solid;
  cursor: pointer;
  user-select: none;
}

.confirm-yes {
  background-color: #ff6b6b;
  border-color: #fff #800 #800 #fff;
  color: #fff;
}

.confirm-yes:hover {
  background-color: #ff5252;
}

.confirm-yes:active {
  border-color: #800 #fff #fff #800;
  padding: 7px 11px 5px 13px;
}

.confirm-no {
  background-color: #c0c0c0;
  border-color: #fff #000 #000 #fff;
}

.confirm-no:hover {
  background-color: #d0d0d0;
}

.confirm-no:active {
  border-color: #000 #fff #fff #000;
  padding: 7px 11px 5px 13px;
}

/* Scrollbar styling */
.settings-content::-webkit-scrollbar {
  width: 16px;
}

.settings-content::-webkit-scrollbar-track {
  background: #c0c0c0;
}

.settings-content::-webkit-scrollbar-thumb {
  background: #808080;
  border: 2px solid;
  border-color: #fff #000 #000 #fff;
}

.settings-content::-webkit-scrollbar-thumb:hover {
  background: #606060;
}
</style>
