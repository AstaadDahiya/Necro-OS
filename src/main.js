import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import '98.css'
import './assets/desktop.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.mount('#app')
