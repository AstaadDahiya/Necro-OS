<template>
  <div 
    class="window"
    :class="{ 'shake': isShaking }"
    :style="windowStyle"
    @mousedown="bringToFront"
  >
    <!-- Title bar -->
    <div 
      class="title-bar"
      @mousedown.stop="startDrag"
    >
      <div class="title-bar-text">{{ windowData.title }}</div>
      <div class="title-bar-controls">
        <button 
          aria-label="Minimize"
          @click.stop="handleMinimize"
        ></button>
        <button 
          aria-label="Maximize"
          @click.stop="handleMaximize"
        ></button>
        <button 
          aria-label="Close"
          @click.stop="handleClose"
        ></button>
      </div>
    </div>

    <!-- Window body -->
    <div class="window-body">
      <slot>
        <p>Window content for {{ windowData.appName }}</p>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useWindowManagerStore } from '../stores/windowManager'

const props = defineProps({
  windowData: {
    type: Object,
    required: true
  }
})

const windowManager = useWindowManagerStore()

// Dragging state
const isDragging = ref(false)
const dragStartX = ref(0)
const dragStartY = ref(0)
const dragOffsetX = ref(0)
const dragOffsetY = ref(0)

// Shake animation state
const isShaking = ref(false)

// Computed window styles
const windowStyle = computed(() => {
  const window = props.windowData
  
  if (window.isMaximized) {
    return {
      position: 'absolute',
      left: '0px',
      top: '0px',
      width: 'calc(100vw)',
      height: 'calc(100vh - 40px)', // Account for taskbar
      zIndex: window.zIndex
    }
  }
  
  return {
    position: 'absolute',
    left: `${window.x}px`,
    top: `${window.y}px`,
    width: `${window.width}px`,
    height: `${window.height}px`,
    zIndex: window.zIndex
  }
})

// Start dragging window
function startDrag(event) {
  if (props.windowData.isMaximized) return
  
  isDragging.value = true
  dragStartX.value = event.clientX
  dragStartY.value = event.clientY
  dragOffsetX.value = props.windowData.x
  dragOffsetY.value = props.windowData.y
  
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
}

// Handle drag movement using CSS transforms for better performance
function onDrag(event) {
  if (!isDragging.value) return
  
  const deltaX = event.clientX - dragStartX.value
  const deltaY = event.clientY - dragStartY.value
  
  let newX = dragOffsetX.value + deltaX
  let newY = dragOffsetY.value + deltaY
  
  // Bounds checking - keep window within viewport
  const maxX = window.innerWidth - props.windowData.width
  const maxY = window.innerHeight - props.windowData.height - 40 // Account for taskbar
  
  newX = Math.max(0, Math.min(newX, maxX))
  newY = Math.max(0, Math.min(newY, maxY))
  
  // Update window position in store (GPU-accelerated via CSS)
  const windowInStore = windowManager.getWindowById(props.windowData.id)
  if (windowInStore) {
    windowInStore.x = newX
    windowInStore.y = newY
  }
}

// End dragging
function endDrag() {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
}

// Bring window to front
function bringToFront() {
  windowManager.bringToFront(props.windowData.id)
}

// Handle minimize button
function handleMinimize() {
  windowManager.minimizeWindow(props.windowData.id)
}

// Handle maximize button
function handleMaximize() {
  windowManager.maximizeWindow(props.windowData.id)
}

// Handle close button
function handleClose() {
  windowManager.closeWindow(props.windowData.id)
}

// Shake animation for ghost behaviors
function shake() {
  isShaking.value = true
  setTimeout(() => {
    isShaking.value = false
  }, 500)
}

// Expose shake method for parent components
defineExpose({
  shake
})
</script>

<style scoped>
/* Use CSS transforms for dragging (GPU accelerated) */
.window {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  min-height: 100px;
  will-change: transform;
}

.title-bar {
  cursor: move;
  user-select: none;
}

.window-body {
  flex: 1;
  overflow: auto;
}

.shake {
  animation: shake 0.5s;
}
</style>
