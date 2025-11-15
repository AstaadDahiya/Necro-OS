import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    target: 'es2015',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'pinia'],
          'apps': [
            './src/components/apps/MyComputer.vue',
            './src/components/apps/InternetExplorer.vue',
            './src/components/apps/Notepad.vue',
            './src/components/apps/RecycleBin.vue',
            './src/components/apps/MSPaint.vue',
            './src/components/apps/Minesweeper.vue'
          ]
        }
      }
    }
  },
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./tests/setup.js']
  }
})
