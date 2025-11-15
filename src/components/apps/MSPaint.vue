<template>
  <div class="ms-paint">
    <div class="toolbar">
      <div class="tool-palette">
        <button 
          v-for="tool in tools" 
          :key="tool.name"
          class="tool-btn"
          :class="{ active: currentTool === tool.name }"
          @click="selectTool(tool.name)"
          :title="tool.label"
        >
          {{ tool.icon }}
        </button>
      </div>
      <div class="color-palette">
        <div 
          v-for="color in colors" 
          :key="color"
          class="color-box"
          :style="{ background: color }"
          :class="{ active: currentColor === color }"
          @click="currentColor = color"
        ></div>
      </div>
      <div class="brush-size">
        <label>Size:</label>
        <input 
          type="range" 
          v-model.number="brushSize" 
          min="1" 
          max="20" 
          step="1"
        />
        <span>{{ brushSize }}</span>
      </div>
    </div>
    <div class="canvas-container">
      <canvas 
        ref="canvasRef"
        @mousedown="startDrawing"
        @mousemove="draw"
        @mouseup="endDrawing"
        @mouseleave="endDrawing"
        width="600"
        height="400"
      ></canvas>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const canvasRef = ref(null)
const ctx = ref(null)
const isDrawing = ref(false)
const currentTool = ref('brush')
const currentColor = ref('#000000')
const brushSize = ref(2)
const lastX = ref(0)
const lastY = ref(0)

const tools = [
  { name: 'brush', icon: '🖌️', label: 'Brush' },
  { name: 'eraser', icon: '🧹', label: 'Eraser' },
  { name: 'fill', icon: '🪣', label: 'Fill' }
]

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#800000',
  '#008000', '#000080', '#808000', '#800080', '#008080'
]

const selectTool = (tool) => {
  currentTool.value = tool
}

const startDrawing = (event) => {
  isDrawing.value = true
  const rect = canvasRef.value.getBoundingClientRect()
  lastX.value = event.clientX - rect.left
  lastY.value = event.clientY - rect.top
  
  if (currentTool.value === 'fill') {
    floodFill(lastX.value, lastY.value)
    isDrawing.value = false
  }
}

const draw = (event) => {
  if (!isDrawing.value) return
  
  const rect = canvasRef.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  ctx.value.beginPath()
  ctx.value.moveTo(lastX.value, lastY.value)
  ctx.value.lineTo(x, y)
  
  if (currentTool.value === 'eraser') {
    ctx.value.strokeStyle = '#FFFFFF'
  } else {
    ctx.value.strokeStyle = currentColor.value
  }
  
  ctx.value.lineWidth = brushSize.value
  ctx.value.lineCap = 'round'
  ctx.value.stroke()
  
  lastX.value = x
  lastY.value = y
}

const endDrawing = () => {
  isDrawing.value = false
}

const floodFill = (x, y) => {
  const imageData = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
  const targetColor = getPixelColor(imageData, Math.floor(x), Math.floor(y))
  const fillColor = hexToRgb(currentColor.value)
  
  if (colorsMatch(targetColor, fillColor)) return
  
  const stack = [[Math.floor(x), Math.floor(y)]]
  
  while (stack.length > 0) {
    const [px, py] = stack.pop()
    
    if (px < 0 || px >= canvasRef.value.width || py < 0 || py >= canvasRef.value.height) continue
    
    const currentColor = getPixelColor(imageData, px, py)
    if (!colorsMatch(currentColor, targetColor)) continue
    
    setPixelColor(imageData, px, py, fillColor)
    
    stack.push([px + 1, py])
    stack.push([px - 1, py])
    stack.push([px, py + 1])
    stack.push([px, py - 1])
  }
  
  ctx.value.putImageData(imageData, 0, 0)
}

const getPixelColor = (imageData, x, y) => {
  const index = (y * imageData.width + x) * 4
  return [
    imageData.data[index],
    imageData.data[index + 1],
    imageData.data[index + 2],
    imageData.data[index + 3]
  ]
}

const setPixelColor = (imageData, x, y, color) => {
  const index = (y * imageData.width + x) * 4
  imageData.data[index] = color[0]
  imageData.data[index + 1] = color[1]
  imageData.data[index + 2] = color[2]
  imageData.data[index + 3] = 255
}

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16),
    255
  ] : [0, 0, 0, 255]
}

const colorsMatch = (a, b) => {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

// Cursed effect for ghost behaviors
const cursedEffect = () => {
  const effects = ['glitch', 'invert', 'distort', 'noise']
  const effect = effects[Math.floor(Math.random() * effects.length)]
  
  const imageData = ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height)
  
  switch (effect) {
    case 'glitch':
      // Shift random rows
      for (let i = 0; i < 10; i++) {
        const y = Math.floor(Math.random() * canvasRef.value.height)
        const shift = Math.floor(Math.random() * 20) - 10
        const rowData = ctx.value.getImageData(0, y, canvasRef.value.width, 1)
        ctx.value.putImageData(rowData, shift, y)
      }
      break
      
    case 'invert':
      // Invert colors
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = 255 - imageData.data[i]
        imageData.data[i + 1] = 255 - imageData.data[i + 1]
        imageData.data[i + 2] = 255 - imageData.data[i + 2]
      }
      ctx.value.putImageData(imageData, 0, 0)
      break
      
    case 'distort':
      // Add random pixels
      for (let i = 0; i < 100; i++) {
        const x = Math.floor(Math.random() * canvasRef.value.width)
        const y = Math.floor(Math.random() * canvasRef.value.height)
        ctx.value.fillStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`
        ctx.value.fillRect(x, y, 2, 2)
      }
      break
      
    case 'noise':
      // Add noise
      for (let i = 0; i < imageData.data.length; i += 4) {
        const noise = Math.random() * 50 - 25
        imageData.data[i] += noise
        imageData.data[i + 1] += noise
        imageData.data[i + 2] += noise
      }
      ctx.value.putImageData(imageData, 0, 0)
      break
  }
}

onMounted(() => {
  ctx.value = canvasRef.value.getContext('2d')
  // Fill with white background
  ctx.value.fillStyle = '#FFFFFF'
  ctx.value.fillRect(0, 0, canvasRef.value.width, canvasRef.value.height)
})

// Expose method for ghost behaviors
defineExpose({
  cursedEffect
})
</script>

<style scoped>
.ms-paint {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
}

.toolbar {
  display: flex;
  gap: 8px;
  padding: 4px;
  background: #c0c0c0;
  border-bottom: 2px solid #808080;
  flex-wrap: wrap;
}

.tool-palette {
  display: flex;
  gap: 2px;
}

.tool-btn {
  width: 32px;
  height: 32px;
  border: 2px outset #dfdfdf;
  background: #c0c0c0;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tool-btn:active,
.tool-btn.active {
  border-style: inset;
}

.color-palette {
  display: grid;
  grid-template-columns: repeat(5, 20px);
  gap: 2px;
}

.color-box {
  width: 20px;
  height: 20px;
  border: 1px solid #000;
  cursor: pointer;
}

.color-box.active {
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px #000;
}

.brush-size {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
}

.brush-size input {
  width: 80px;
}

.brush-size span {
  min-width: 20px;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  padding: 8px;
  background: #808080;
}

canvas {
  background: white;
  cursor: crosshair;
  display: block;
  border: 1px solid #000;
}
</style>
