import { defineStore } from 'pinia'
import { audioService } from '../utils/audioService'

export const useWindowManagerStore = defineStore('windowManager', {
  state: () => ({
    openWindows: [],
    nextZIndex: 100,
    minimizedWindows: []
  }),
  
  getters: {
    activeWindow: (state) => {
      return state.openWindows.reduce((max, window) => 
        window.zIndex > (max?.zIndex || 0) ? window : max
      , null)
    },
    
    getWindowById: (state) => (id) => {
      return state.openWindows.find(w => w.id === id)
    }
  },
  
  actions: {
    openWindow(appName, options = {}) {
      // Limit maximum open windows to 10 for performance
      if (this.openWindows.length >= 10) {
        console.warn('Maximum window limit (10) reached')
        audioService.play('error')
        return null
      }
      
      const id = crypto.randomUUID()
      const window = {
        id,
        appName,
        title: options.title || appName,
        component: options.component || null,
        x: options.x || 100 + (this.openWindows.length * 30),
        y: options.y || 100 + (this.openWindows.length * 30),
        width: options.width || 400,
        height: options.height || 300,
        zIndex: this.nextZIndex++,
        isMinimized: false,
        isMaximized: false,
        icon: options.icon || appName,
        data: options.data || {}
      }
      
      this.openWindows.push(window)
      
      // Play window open sound
      audioService.play('windowOpen')
      
      return window
    },
    
    closeWindow(windowId) {
      const index = this.openWindows.findIndex(w => w.id === windowId)
      if (index !== -1) {
        this.openWindows.splice(index, 1)
        
        // Play window close sound
        audioService.play('windowClose')
      }
      
      // Also remove from minimized if present
      const minIndex = this.minimizedWindows.findIndex(w => w.id === windowId)
      if (minIndex !== -1) {
        this.minimizedWindows.splice(minIndex, 1)
      }
    },
    
    minimizeWindow(windowId) {
      const window = this.openWindows.find(w => w.id === windowId)
      if (window && !window.isMinimized) {
        window.isMinimized = true
        this.minimizedWindows.push(window)
      }
    },
    
    restoreWindow(windowId) {
      const window = this.openWindows.find(w => w.id === windowId)
      if (window && window.isMinimized) {
        window.isMinimized = false
        const minIndex = this.minimizedWindows.findIndex(w => w.id === windowId)
        if (minIndex !== -1) {
          this.minimizedWindows.splice(minIndex, 1)
        }
        this.bringToFront(windowId)
      }
    },
    
    maximizeWindow(windowId) {
      const window = this.openWindows.find(w => w.id === windowId)
      if (window) {
        window.isMaximized = !window.isMaximized
        this.bringToFront(windowId)
      }
    },
    
    bringToFront(windowId) {
      const window = this.openWindows.find(w => w.id === windowId)
      if (window) {
        window.zIndex = this.nextZIndex++
      }
    }
  }
})
