<template>
  <div 
    v-if="!disableCRT"
    class="crt-filter"
    :class="{ 'crt-flicker': flickerActive && !disableFlicker }"
    :style="crtStyles"
  >
    <div class="crt-scanlines"></div>
    <div class="crt-curvature"></div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useVisualCorruptionStore } from '../stores/visualCorruption'

const visualCorruption = useVisualCorruptionStore()

// Accessibility preferences from localStorage
const disableCRT = ref(false)
const disableFlicker = ref(false)

// Load accessibility preferences on mount
onMounted(() => {
  disableCRT.value = localStorage.getItem('necro-os-disable-crt') === 'true'
  disableFlicker.value = localStorage.getItem('necro-os-disable-flicker') === 'true'
  
  if (disableCRT.value) {
    console.log('[CRTFilter] CRT filter disabled via accessibility settings')
  }
  if (disableFlicker.value) {
    console.log('[CRTFilter] Flicker effects disabled via accessibility settings')
  }
})

// Reactive computed properties from store
const flickerActive = computed(() => visualCorruption.crtFlickerActive)
const barrelDistortion = computed(() => visualCorruption.crtBarrelDistortion)
const intensity = computed(() => visualCorruption.crtIntensity)

// Dynamic CRT styles based on haunting level
const crtStyles = computed(() => {
  const level = intensity.value
  
  return {
    '--barrel-distortion': `${barrelDistortion.value}%`,
    '--phosphor-intensity': level >= 3 ? '0.15' : '0.1',
    '--scanline-opacity': level >= 4 ? '0.6' : '0.5',
    '--flicker-intensity': level >= 5 ? '0.93' : '0.97'
  }
})

// Update intensity when haunting level changes
function updateIntensity(level) {
  console.log(`[CRTFilter] Intensity updated to level ${level}`)
  
  // Level 3+: Flicker animation is applied via class binding
  // Level 5: Increased barrel distortion (handled by store)
  
  if (level >= 5) {
    console.log('[CRTFilter] Maximum distortion active (8%)')
  } else if (level >= 3) {
    console.log('[CRTFilter] Flicker effect active')
  }
}

// Watch for intensity changes and update effects
watch(intensity, (newLevel) => {
  updateIntensity(newLevel)
})
</script>

<style scoped>
.crt-filter {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10000;
  overflow: hidden;
}

/**
 * Scanlines effect - Simulates horizontal scan lines from CRT monitors
 * 
 * Implementation:
 * - Uses repeating-linear-gradient to create horizontal lines
 * - Pattern: 1px black line, 1px transparent gap (2px total height)
 * - Opacity controlled by --scanline-opacity CSS variable (0.5 default, 0.6 at level 4+)
 * 
 * Calculation:
 * - 0deg = horizontal lines (perpendicular to screen top)
 * - rgba(0, 0, 0, opacity) = black lines with variable opacity
 * - 2px repeat = creates 1px line + 1px gap pattern
 * 
 * Animation:
 * - scanline-jitter creates subtle vertical movement (0px -> 1px -> 0px)
 * - 0.1s duration creates rapid jitter effect typical of old CRTs
 */
.crt-scanlines {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: repeating-linear-gradient(
    0deg,
    rgba(0, 0, 0, var(--scanline-opacity, 0.5)) 0px,
    transparent 1px,
    transparent 2px
  );
  animation: scanline-jitter 0.1s infinite;
  pointer-events: none;
}

/**
 * Barrel distortion and curvature - Simulates curved CRT screen
 * 
 * Barrel Distortion Calculation:
 * - Uses CSS perspective and rotateX to create curved appearance
 * - Formula: rotateX(distortion * 0.1deg)
 * - At 3% distortion: rotateX(0.3deg) - subtle curve
 * - At 8% distortion: rotateX(0.8deg) - extreme warping (level 5)
 * 
 * Border Radius Calculation:
 * - Simulates rounded corners of CRT glass
 * - Horizontal: distortion * 0.3% (e.g., 3% -> 0.9% radius)
 * - Vertical: distortion * 0.5% (e.g., 3% -> 1.5% radius)
 * - Creates elliptical corners typical of CRT monitors
 * 
 * Phosphor Glow Effect:
 * - Green-tinted glow simulates phosphor coating on CRT screens
 * - Two-layer box-shadow for depth:
 *   - Outer: 100px blur with variable intensity
 *   - Inner: 50px blur at 50% of outer intensity
 * - Intensity increases from 0.1 (level 1-2) to 0.15 (level 3+)
 * 
 * Performance:
 * - Uses transform instead of position for GPU acceleration
 * - perspective(1000px) creates 3D rendering context
 */
.crt-curvature {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform: perspective(1000px) rotateX(calc(var(--barrel-distortion) * 0.1deg));
  border-radius: calc(var(--barrel-distortion) * 0.3%) / calc(var(--barrel-distortion) * 0.5%);
  pointer-events: none;
  
  /* Phosphor glow effect - Green tint from CRT phosphor coating */
  box-shadow: 
    inset 0 0 100px rgba(0, 255, 0, var(--phosphor-intensity)),
    inset 0 0 50px rgba(0, 255, 0, calc(var(--phosphor-intensity) * 0.5));
}

/* Scanline jitter animation */
@keyframes scanline-jitter {
  0% { 
    transform: translateY(0); 
  }
  50% { 
    transform: translateY(1px); 
  }
  100% { 
    transform: translateY(0); 
  }
}

/* Flicker effect for level 3+ */
.crt-flicker {
  animation: crt-flicker 0.1s infinite;
}

@keyframes crt-flicker {
  0%, 100% { 
    opacity: 1; 
  }
  50% { 
    opacity: var(--flicker-intensity, 0.97); 
  }
}

/* GPU acceleration hints */
.crt-filter,
.crt-scanlines,
.crt-curvature {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>
