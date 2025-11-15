<template>
  <Transition name="achievement-slide">
    <div v-if="visible" class="achievement-notification" @click="dismiss">
      <div class="achievement-icon">{{ achievement.icon }}</div>
      <div class="achievement-content">
        <div class="achievement-title">Achievement Unlocked!</div>
        <div class="achievement-name">{{ achievement.name }}</div>
        <div class="achievement-description">{{ achievement.description }}</div>
      </div>
      <div class="achievement-close">×</div>
    </div>
  </Transition>
</template>

<script>
export default {
  name: 'AchievementNotification',
  data() {
    return {
      visible: false,
      achievement: null,
      dismissTimer: null
    }
  },
  mounted() {
    // Listen for achievement unlock events
    window.addEventListener('achievement-unlocked', this.handleAchievementUnlocked)
  },
  beforeUnmount() {
    window.removeEventListener('achievement-unlocked', this.handleAchievementUnlocked)
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer)
    }
  },
  methods: {
    handleAchievementUnlocked(event) {
      const { name, description, icon } = event.detail
      
      this.achievement = { name, description, icon }
      this.visible = true
      
      // Auto-dismiss after 5 seconds
      if (this.dismissTimer) {
        clearTimeout(this.dismissTimer)
      }
      
      this.dismissTimer = setTimeout(() => {
        this.dismiss()
      }, 5000)
      
      console.log('[AchievementNotification] Showing achievement:', name)
    },
    dismiss() {
      this.visible = false
      
      if (this.dismissTimer) {
        clearTimeout(this.dismissTimer)
        this.dismissTimer = null
      }
    }
  }
}
</script>

<style scoped>
.achievement-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 320px;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border: 2px solid #ffd700;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2);
  cursor: pointer;
  z-index: 100000;
  animation: achievement-glow 2s ease-in-out infinite;
}

.achievement-notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.3);
}

.achievement-icon {
  font-size: 48px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
}

.achievement-content {
  flex: 1;
  min-width: 0;
}

.achievement-title {
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  font-weight: bold;
  color: #ffd700;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.achievement-name {
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.achievement-description {
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
  color: #cccccc;
  line-height: 1.4;
}

.achievement-close {
  font-size: 24px;
  color: #888888;
  cursor: pointer;
  flex-shrink: 0;
  line-height: 1;
  padding: 0 4px;
  transition: color 0.2s;
}

.achievement-close:hover {
  color: #ffffff;
}

/* Slide animation */
.achievement-slide-enter-active {
  animation: achievement-slide-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.achievement-slide-leave-active {
  animation: achievement-slide-out 0.3s ease-in;
}

@keyframes achievement-slide-in {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes achievement-slide-out {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(400px);
    opacity: 0;
  }
}

@keyframes achievement-glow {
  0%, 100% {
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.3), 0 0 40px rgba(255, 215, 0, 0.2);
  }
  50% {
    box-shadow: 0 8px 24px rgba(255, 215, 0, 0.5), 0 0 60px rgba(255, 215, 0, 0.4);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .achievement-notification {
    top: 10px;
    right: 10px;
    left: 10px;
    width: auto;
  }
}
</style>
