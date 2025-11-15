<template>
  <div 
    class="start-menu-overlay"
    @click="closeMenu"
  >
    <ul 
      class="start-menu"
      @click.stop
    >
      <!-- Windows 95 branding sidebar -->
      <div class="menu-sidebar">
        <div class="sidebar-text">
          <span class="windows-text">Windows</span>
          <span class="version-text">95</span>
        </div>
      </div>

      <!-- Menu items -->
      <div class="menu-items">
        <li
          v-for="(item, index) in menuItems"
          :key="index"
          :class="{ 'menu-divider': item.divider }"
          @click="handleItemClick(item)"
        >
          <template v-if="!item.divider">
            <span class="menu-icon">{{ item.icon }}</span>
            <span class="menu-label">{{ item.name }}</span>
          </template>
        </li>
      </div>
    </ul>
  </div>
</template>

<script setup>
import { useWindowManagerStore } from '../stores/windowManager'

const emit = defineEmits(['close', 'launch-app', 'shutdown'])

const windowManager = useWindowManagerStore()

// Menu items configuration
const menuItems = [
  { name: 'My Computer', icon: '💻', app: 'mycomputer' },
  { name: 'Internet Explorer', icon: '🌐', app: 'ie' },
  { name: 'Notepad', icon: '📝', app: 'notepad' },
  { name: 'Paint', icon: '🎨', app: 'paint' },
  { name: 'Calculator', icon: '🔢', app: 'calculator' },
  { name: 'Task Manager', icon: '📊', app: 'taskmanager' },
  { name: 'Command Prompt', icon: '⌨️', app: 'commandprompt' },
  { name: 'Minesweeper', icon: '💣', app: 'minesweeper' },
  { name: 'Recycle Bin', icon: '🗑️', app: 'recyclebin' },
  { name: 'SoulScanner™', icon: '📹', app: 'soulscanner' },
  { name: 'Spirit Board', icon: '🔮', app: 'spiritboard' },
  { divider: true },
  { name: 'Settings', icon: '⚙️', app: 'settings' },
  { name: 'Shut Down...', icon: '⏻', action: 'shutdown' }
]

// Handle menu item click
function handleItemClick(item) {
  if (item.divider) return
  
  if (item.action === 'shutdown') {
    // Trigger BSOD (will be implemented in later tasks)
    emit('shutdown')
    closeMenu()
  } else if (item.app) {
    launchApp(item.app, item.name)
  }
}

// Launch application
function launchApp(appName, title) {
  windowManager.openWindow(appName, { title })
  emit('launch-app', appName)
  closeMenu()
}

// Close menu
function closeMenu() {
  emit('close')
}
</script>

<style scoped>
.start-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
}

.start-menu {
  position: absolute;
  bottom: 42px;
  left: 2px;
  width: 250px;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-sidebar {
  width: 30px;
  background: linear-gradient(to bottom, #000080, #1084d0);
  display: flex;
  align-items: flex-end;
  padding: 8px 4px;
}

.sidebar-text {
  writing-mode: vertical-rl;
  transform: rotate(180deg);
  color: white;
  font-weight: bold;
  font-size: 20px;
  letter-spacing: 2px;
  display: flex;
  gap: 8px;
}

.windows-text {
  font-family: 'MS Sans Serif', sans-serif;
}

.version-text {
  font-size: 16px;
  opacity: 0.9;
}

.menu-items {
  flex: 1;
  padding: 4px 0;
}

.menu-items li {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  font-size: 11px;
  user-select: none;
  list-style: none;
}

.menu-items li:hover:not(.menu-divider) {
  background-color: #000080;
  color: white;
}

.menu-divider {
  height: 1px;
  background-color: #808080;
  margin: 4px 8px;
  padding: 0;
  cursor: default;
}

.menu-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
}

.menu-label {
  font-family: 'MS Sans Serif', sans-serif;
}
</style>
