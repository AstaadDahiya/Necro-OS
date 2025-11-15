import { defineAsyncComponent } from 'vue'

// Lazy load app components for better performance
export const appComponents = {
  mycomputer: defineAsyncComponent(() => import('../components/apps/MyComputer.vue')),
  ie: defineAsyncComponent(() => import('../components/apps/InternetExplorer.vue')),
  notepad: defineAsyncComponent(() => import('../components/apps/Notepad.vue')),
  recyclebin: defineAsyncComponent(() => import('../components/apps/RecycleBin.vue')),
  paint: defineAsyncComponent(() => import('../components/apps/MSPaint.vue')),
  minesweeper: defineAsyncComponent(() => import('../components/apps/Minesweeper.vue')),
  soulscanner: defineAsyncComponent(() => import('../components/apps/SoulScanner.vue')),
  spiritboard: defineAsyncComponent(() => import('../components/apps/SpiritBoard.vue')),
  calculator: defineAsyncComponent(() => import('../components/apps/Calculator.vue')),
  taskmanager: defineAsyncComponent(() => import('../components/apps/TaskManager.vue')),
  commandprompt: defineAsyncComponent(() => import('../components/apps/CommandPrompt.vue')),
  terminal: defineAsyncComponent(() => import('../components/TerminalPopup.vue')),
  settings: defineAsyncComponent(() => import('../components/SettingsPanel.vue'))
}

// Get component for app name
export function getAppComponent(appName) {
  return appComponents[appName] || null
}
