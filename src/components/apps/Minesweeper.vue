<template>
  <div class="minesweeper">
    <div class="game-header">
      <div class="counter">{{ minesLeft.toString().padStart(3, '0') }}</div>
      <button class="face-btn" @click="initGame(9, 9, 10)">
        {{ gameState === 'playing' ? '🙂' : gameState === 'won' ? '😎' : '😵' }}
      </button>
      <div class="counter">{{ timer.toString().padStart(3, '0') }}</div>
    </div>
    <div class="game-board">
      <div 
        v-for="(row, y) in board" 
        :key="y" 
        class="board-row"
      >
        <div 
          v-for="(cell, x) in row" 
          :key="x"
          class="cell"
          :class="{ 
            revealed: cell.revealed, 
            flagged: cell.flagged,
            mine: cell.revealed && cell.isMine,
            exploded: cell.exploded
          }"
          @click="revealCell(y, x)"
          @contextmenu.prevent="flagCell(y, x)"
        >
          <span v-if="cell.revealed && !cell.isMine && cell.adjacentMines > 0" 
                :class="`number-${cell.adjacentMines}`">
            {{ cell.adjacentMines }}
          </span>
          <span v-if="cell.revealed && cell.isMine">💣</span>
          <span v-if="!cell.revealed && cell.flagged">🚩</span>
        </div>
      </div>
    </div>
    <div class="status-bar">
      <span>{{ statusText }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  windowId: {
    type: String,
    required: true
  }
})

const board = ref([])
const gameState = ref('playing') // 'playing', 'won', 'lost'
const timer = ref(0)
const timerInterval = ref(null)
const rows = ref(9)
const cols = ref(9)
const totalMines = ref(10)

const minesLeft = computed(() => {
  const flaggedCount = board.value.flat().filter(cell => cell.flagged).length
  return totalMines.value - flaggedCount
})

const statusText = computed(() => {
  if (gameState.value === 'won') return 'You won! 🎉'
  if (gameState.value === 'lost') return 'Game Over 💀'
  return 'Click to reveal, right-click to flag'
})

const initGame = (r, c, mines) => {
  rows.value = r
  cols.value = c
  totalMines.value = mines
  gameState.value = 'playing'
  timer.value = 0
  
  // Clear existing timer
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
  
  // Create empty board
  board.value = Array(r).fill(null).map(() =>
    Array(c).fill(null).map(() => ({
      isMine: false,
      revealed: false,
      flagged: false,
      adjacentMines: 0,
      exploded: false
    }))
  )
  
  // Place mines randomly
  let minesPlaced = 0
  while (minesPlaced < mines) {
    const y = Math.floor(Math.random() * r)
    const x = Math.floor(Math.random() * c)
    
    if (!board.value[y][x].isMine) {
      board.value[y][x].isMine = true
      minesPlaced++
    }
  }
  
  // Calculate adjacent mines
  for (let y = 0; y < r; y++) {
    for (let x = 0; x < c; x++) {
      if (!board.value[y][x].isMine) {
        board.value[y][x].adjacentMines = countAdjacentMines(y, x)
      }
    }
  }
  
  // Start timer
  timerInterval.value = setInterval(() => {
    if (gameState.value === 'playing' && timer.value < 999) {
      timer.value++
    }
  }, 1000)
}

const countAdjacentMines = (y, x) => {
  let count = 0
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy === 0 && dx === 0) continue
      const ny = y + dy
      const nx = x + dx
      if (ny >= 0 && ny < rows.value && nx >= 0 && nx < cols.value) {
        if (board.value[ny][nx].isMine) count++
      }
    }
  }
  return count
}

const revealCell = (y, x) => {
  if (gameState.value !== 'playing') return
  
  const cell = board.value[y][x]
  if (cell.revealed || cell.flagged) return
  
  cell.revealed = true
  
  if (cell.isMine) {
    cell.exploded = true
    gameState.value = 'lost'
    revealAllMines()
    if (timerInterval.value) clearInterval(timerInterval.value)
    return
  }
  
  // Flood fill if no adjacent mines
  if (cell.adjacentMines === 0) {
    floodFill(y, x)
  }
  
  checkWin()
}

const floodFill = (y, x) => {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dy === 0 && dx === 0) continue
      const ny = y + dy
      const nx = x + dx
      if (ny >= 0 && ny < rows.value && nx >= 0 && nx < cols.value) {
        const cell = board.value[ny][nx]
        if (!cell.revealed && !cell.flagged && !cell.isMine) {
          cell.revealed = true
          if (cell.adjacentMines === 0) {
            floodFill(ny, nx)
          }
        }
      }
    }
  }
}

const flagCell = (y, x) => {
  if (gameState.value !== 'playing') return
  
  const cell = board.value[y][x]
  if (cell.revealed) return
  
  cell.flagged = !cell.flagged
}

const revealAllMines = () => {
  for (let y = 0; y < rows.value; y++) {
    for (let x = 0; x < cols.value; x++) {
      if (board.value[y][x].isMine) {
        board.value[y][x].revealed = true
      }
    }
  }
}

const checkWin = () => {
  let allNonMinesRevealed = true
  for (let y = 0; y < rows.value; y++) {
    for (let x = 0; x < cols.value; x++) {
      const cell = board.value[y][x]
      if (!cell.isMine && !cell.revealed) {
        allNonMinesRevealed = false
        break
      }
    }
    if (!allNonMinesRevealed) break
  }
  
  if (allNonMinesRevealed) {
    gameState.value = 'won'
    if (timerInterval.value) clearInterval(timerInterval.value)
  }
}

// AI makes a move (for ghost behaviors)
const aiMove = () => {
  if (gameState.value !== 'playing') return
  
  // Find all unrevealed, unflagged cells
  const unrevealedCells = []
  for (let y = 0; y < rows.value; y++) {
    for (let x = 0; x < cols.value; x++) {
      const cell = board.value[y][x]
      if (!cell.revealed && !cell.flagged) {
        unrevealedCells.push({ y, x, isMine: cell.isMine })
      }
    }
  }
  
  if (unrevealedCells.length === 0) return
  
  // AI strategy: 70% chance to pick a safe cell, 30% chance random
  const safeCells = unrevealedCells.filter(c => !c.isMine)
  let targetCell
  
  if (safeCells.length > 0 && Math.random() < 0.7) {
    targetCell = safeCells[Math.floor(Math.random() * safeCells.length)]
  } else {
    targetCell = unrevealedCells[Math.floor(Math.random() * unrevealedCells.length)]
  }
  
  revealCell(targetCell.y, targetCell.x)
}

onMounted(() => {
  initGame(9, 9, 10)
})

onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value)
  }
})

// Expose method for ghost behaviors
defineExpose({
  aiMove
})
</script>

<style scoped>
.minesweeper {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
  padding: 8px;
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #c0c0c0;
  border: 3px inset #dfdfdf;
  margin-bottom: 8px;
}

.counter {
  background: #000;
  color: #ff0000;
  font-family: 'Courier New', monospace;
  font-size: 24px;
  font-weight: bold;
  padding: 4px 8px;
  border: 2px inset #808080;
  min-width: 60px;
  text-align: center;
}

.face-btn {
  width: 40px;
  height: 40px;
  font-size: 24px;
  border: 2px outset #dfdfdf;
  background: #c0c0c0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.face-btn:active {
  border-style: inset;
}

.game-board {
  display: inline-block;
  border: 3px inset #dfdfdf;
  background: #c0c0c0;
  padding: 4px;
}

.board-row {
  display: flex;
}

.cell {
  width: 24px;
  height: 24px;
  border: 2px outset #dfdfdf;
  background: #c0c0c0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  font-weight: bold;
  user-select: none;
}

.cell:active {
  border-style: inset;
}

.cell.revealed {
  border: 1px solid #808080;
  background: #bdbdbd;
  cursor: default;
}

.cell.mine {
  background: #ff0000;
}

.cell.exploded {
  background: #ff0000;
}

.cell.flagged {
  font-size: 14px;
}

.number-1 { color: #0000ff; }
.number-2 { color: #008000; }
.number-3 { color: #ff0000; }
.number-4 { color: #000080; }
.number-5 { color: #800000; }
.number-6 { color: #008080; }
.number-7 { color: #000000; }
.number-8 { color: #808080; }

.status-bar {
  padding: 4px 8px;
  margin-top: 8px;
  background: #c0c0c0;
  border: 2px inset #dfdfdf;
  font-size: 11px;
  text-align: center;
}
</style>
