<template>
  <div class="phantom-notifications-container">
    <transition-group name="notification-slide">
      <div 
        v-for="notification in visibleNotifications" 
        :key="notification.id"
        class="phantom-notification"
        :class="[`notification-${notification.type}`, { 'notification-dismissing': dismissingIds.has(notification.id) }]"
      >
        <div class="notification-header">
          <div class="notification-icon">
            <span v-if="notification.type === 'warning'">⚠️</span>
            <span v-else-if="notification.type === 'error'">❌</span>
            <span v-else>ℹ️</span>
          </div>
          <div class="notification-title">System Notification</div>
        </div>
        <div class="notification-body">
          {{ notification.message }}
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useVisualCorruptionStore } from '../stores/visualCorruption'
import { audioService } from '../utils/audioService'

const visualCorruption = useVisualCorruptionStore()
const dismissingIds = ref(new Set())

// Get visible notifications (limited to maxConcurrent)
const visibleNotifications = computed(() => {
  return visualCorruption.activeNotifications.slice(0, visualCorruption.phantomNotifications.maxConcurrent)
})

// Watch for notifications being added and play sound
watch(() => visualCorruption.activeNotifications, (newNotifications, oldNotifications) => {
  if (oldNotifications) {
    // Find notifications that were added
    const oldIds = new Set(oldNotifications.map(n => n.id))
    const newIds = new Set(newNotifications.map(n => n.id))
    
    newIds.forEach(id => {
      if (!oldIds.has(id)) {
        // New notification added, play sound
        audioService.play('error') // Using error sound for notifications
      }
    })
    
    // Find notifications that were removed
    oldIds.forEach(id => {
      if (!newIds.has(id)) {
        // Notification was removed, mark as dismissing
        dismissingIds.value.add(id)
        
        // Clean up after animation
        setTimeout(() => {
          dismissingIds.value.delete(id)
        }, 300)
      }
    })
  }
}, { deep: true })
</script>

<style scoped>
.phantom-notifications-container {
  position: fixed;
  bottom: 50px; /* Above taskbar */
  right: 20px;
  z-index: 9000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.phantom-notification {
  background: #c0c0c0;
  border: 2px solid;
  border-color: #ffffff #808080 #808080 #ffffff;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.5);
  width: 300px;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  pointer-events: auto;
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.notification-header {
  background: linear-gradient(to right, #000080, #1084d0);
  color: white;
  padding: 3px 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: bold;
}

.notification-icon {
  font-size: 14px;
  line-height: 1;
}

.notification-title {
  flex: 1;
  font-size: 11px;
}

.notification-body {
  padding: 10px;
  background: #c0c0c0;
  color: #000000;
  line-height: 1.4;
}

/* Slide-in animation from right */
.notification-slide-enter-active {
  animation: slide-in-right 0.3s ease-out;
}

.notification-slide-leave-active {
  animation: fade-out 0.3s ease-out;
}

@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fade-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.notification-dismissing {
  animation: fade-out 0.3s ease-out forwards;
}

/* Different notification types */
.notification-warning .notification-header {
  background: linear-gradient(to right, #808000, #c0c000);
}

.notification-error .notification-header {
  background: linear-gradient(to right, #800000, #c00000);
}

.notification-info .notification-header {
  background: linear-gradient(to right, #000080, #1084d0);
}
</style>
