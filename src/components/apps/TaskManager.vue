<template>
  <div class="task-manager">
    <div class="task-manager-header">
      <div class="tabs">
        <button class="tab active">Processes</button>
        <button class="tab">Performance</button>
      </div>
    </div>

    <div class="task-manager-content">
      <!-- Process list table -->
      <div class="process-table">
        <div class="table-header">
          <div class="col-name">Process Name</div>
          <div class="col-pid">PID</div>
          <div class="col-cpu">CPU</div>
          <div class="col-memory">Memory</div>
          <div class="col-status">Status</div>
        </div>
        
        <div class="table-body">
          <div 
            v-for="process in allProcesses" 
            :key="process.pid"
            class="process-row"
            :class="{ 'cursed': process.cursed }"
          >
            <div class="col-name">{{ process.name }}</div>
            <div class="col-pid">{{ process.pid }}</div>
            <div class="col-cpu">{{ process.cpu }}%</div>
            <div class="col-memory">{{ process.memory }} MB</div>
            <div class="col-status">{{ process.status }}</div>
          </div>
        </div>
      </div>

      <!-- System stats -->
      <div class="system-stats">
        <div class="stat">
          <span class="stat-label">Total Processes:</span>
          <span class="stat-value">{{ allProcesses.length }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">CPU Usage:</span>
          <span class="stat-value">{{ totalCPU }}%</span>
        </div>
        <div class="stat">
          <span class="stat-label">Memory Usage:</span>
          <span class="stat-value">{{ totalMemory }} MB</span>
        </div>
      </div>
    </div>

    <div class="task-manager-footer">
      <button class="btn" @click="endProcess" :disabled="!selectedProcess">
        End Process
      </button>
      <button class="btn" @click="refreshProcesses">
        Refresh
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdvancedHauntingStore } from '../../stores/advancedHaunting'
import { getCursedProcesses } from '../../utils/possessedAppsService'

const advancedHaunting = useAdvancedHauntingStore()

// Process state
const normalProcesses = ref([])
const cursedProcesses = ref([])
const selectedProcess = ref(null)
let refreshInterval = null

// Generate normal system processes
function generateNormalProcesses() {
  const normalNames = [
    'System',
    'explorer.exe',
    'svchost.exe',
    'winlogon.exe',
    'csrss.exe',
    'lsass.exe',
    'services.exe',
    'smss.exe',
    'taskmgr.exe',
    'dwm.exe'
  ]
  
  return normalNames.map((name, index) => ({
    name,
    pid: 100 + index * 100,
    cpu: Math.floor(Math.random() * 5),
    memory: Math.floor(Math.random() * 100) + 20,
    status: 'Running',
    cursed: false
  }))
}

// Refresh process list
function refreshProcesses() {
  // Update normal processes with random CPU/Memory fluctuations
  normalProcesses.value = normalProcesses.value.map(proc => ({
    ...proc,
    cpu: Math.max(0, proc.cpu + (Math.random() - 0.5) * 2),
    memory: Math.max(20, proc.memory + (Math.random() - 0.5) * 10)
  }))
  
  // Get cursed processes based on possession level
  const possessionLevel = advancedHaunting.possessionLevel
  cursedProcesses.value = getCursedProcesses(possessionLevel)
}

// Combined process list
const allProcesses = computed(() => {
  return [...normalProcesses.value, ...cursedProcesses.value]
    .sort((a, b) => a.name.localeCompare(b.name))
})

// Total CPU usage
const totalCPU = computed(() => {
  const total = allProcesses.value.reduce((sum, proc) => sum + proc.cpu, 0)
  return Math.min(100, Math.round(total))
})

// Total memory usage
const totalMemory = computed(() => {
  const total = allProcesses.value.reduce((sum, proc) => sum + proc.memory, 0)
  return Math.round(total)
})

// End process (doesn't actually work on cursed processes)
function endProcess() {
  if (!selectedProcess.value) return
  
  // Can't end cursed processes
  if (selectedProcess.value.cursed) {
    // Maybe show an error or just do nothing
    return
  }
  
  // Remove from normal processes
  normalProcesses.value = normalProcesses.value.filter(
    p => p.pid !== selectedProcess.value.pid
  )
  selectedProcess.value = null
}

// Initialize
onMounted(() => {
  normalProcesses.value = generateNormalProcesses()
  refreshProcesses()
  
  // Auto-refresh every 3 seconds
  refreshInterval = setInterval(refreshProcesses, 3000)
})

// Cleanup
onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval)
  }
})
</script>

<style scoped>
.task-manager {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #c0c0c0;
  font-family: 'MS Sans Serif', sans-serif;
  font-size: 11px;
}

.task-manager-header {
  border-bottom: 2px solid #808080;
}

.tabs {
  display: flex;
  padding: 2px;
  gap: 2px;
}

.tab {
  padding: 4px 12px;
  background: #c0c0c0;
  border: 1px solid #808080;
  cursor: pointer;
  font-size: 11px;
}

.tab.active {
  background: #fff;
  border-bottom-color: #fff;
}

.task-manager-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 4px;
  gap: 8px;
}

.process-table {
  flex: 1;
  display: flex;
  flex-direction: column;
  border: 2px inset #dfdfdf;
  background: #fff;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 4px;
  background: #c0c0c0;
  border-bottom: 1px solid #808080;
  font-weight: bold;
}

.table-body {
  flex: 1;
  overflow-y: auto;
}

.process-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  padding: 4px;
  border-bottom: 1px solid #dfdfdf;
  cursor: pointer;
}

.process-row:hover {
  background: #e0e0e0;
}

.process-row.cursed {
  color: #8b0000;
  font-weight: bold;
  animation: flicker 3s infinite;
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.col-name { text-align: left; }
.col-pid { text-align: center; }
.col-cpu { text-align: right; }
.col-memory { text-align: right; }
.col-status { text-align: center; }

.system-stats {
  display: flex;
  gap: 16px;
  padding: 8px;
  background: #fff;
  border: 2px inset #dfdfdf;
}

.stat {
  display: flex;
  gap: 8px;
}

.stat-label {
  font-weight: bold;
}

.stat-value {
  color: #000080;
}

.task-manager-footer {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-top: 2px solid #808080;
}

.btn {
  padding: 4px 12px;
  font-size: 11px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
