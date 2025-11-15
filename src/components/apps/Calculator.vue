<template>
  <div class="calculator">
    <div class="calculator-display">
      {{ display }}
    </div>
    
    <div class="calculator-buttons">
      <button @click="clear" class="btn-function">C</button>
      <button @click="clearEntry" class="btn-function">CE</button>
      <button @click="backspace" class="btn-function">←</button>
      <button @click="appendOperator('/')" class="btn-operator">÷</button>
      
      <button @click="appendNumber('7')" class="btn-number">7</button>
      <button @click="appendNumber('8')" class="btn-number">8</button>
      <button @click="appendNumber('9')" class="btn-number">9</button>
      <button @click="appendOperator('*')" class="btn-operator">×</button>
      
      <button @click="appendNumber('4')" class="btn-number">4</button>
      <button @click="appendNumber('5')" class="btn-number">5</button>
      <button @click="appendNumber('6')" class="btn-number">6</button>
      <button @click="appendOperator('-')" class="btn-operator">−</button>
      
      <button @click="appendNumber('1')" class="btn-number">1</button>
      <button @click="appendNumber('2')" class="btn-number">2</button>
      <button @click="appendNumber('3')" class="btn-number">3</button>
      <button @click="appendOperator('+')" class="btn-operator">+</button>
      
      <button @click="appendNumber('0')" class="btn-number btn-zero">0</button>
      <button @click="appendDecimal" class="btn-number">.</button>
      <button @click="calculate" class="btn-equals">=</button>
    </div>
    
    <!-- Calculation History (for correction behavior) -->
    <div v-if="history.length > 0" class="calculator-history">
      <div class="history-title">History:</div>
      <div 
        v-for="(entry, index) in history.slice(-3)" 
        :key="index"
        class="history-entry"
        :class="{ 'history-incorrect': entry.wasIncorrect }"
      >
        {{ entry.expression }} = {{ entry.displayedResult }}
        <span v-if="entry.wasIncorrect" class="history-correction">
          ({{ entry.actualResult }})
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAdvancedHauntingStore } from '../../stores/advancedHaunting'
import { getCalculatorResult } from '../../utils/possessedAppsService'

export default {
  name: 'Calculator',
  
  setup() {
    const advancedHaunting = useAdvancedHauntingStore()
    
    // Calculator state
    const display = ref('0')
    const currentValue = ref(0)
    const previousValue = ref(null)
    const operator = ref(null)
    const waitingForOperand = ref(false)
    const history = ref([])
    const lastCalculation = ref(null)
    
    // Get current possession level
    const possessionLevel = computed(() => advancedHaunting.currentPossessionLevel)
    
    // Append a number to the display
    function appendNumber(num) {
      if (waitingForOperand.value) {
        display.value = String(num)
        waitingForOperand.value = false
      } else {
        display.value = display.value === '0' ? String(num) : display.value + num
      }
    }
    
    // Append decimal point
    function appendDecimal() {
      if (waitingForOperand.value) {
        display.value = '0.'
        waitingForOperand.value = false
      } else if (display.value.indexOf('.') === -1) {
        display.value += '.'
      }
    }
    
    // Append an operator
    function appendOperator(nextOperator) {
      const inputValue = parseFloat(display.value)
      
      if (previousValue.value === null) {
        previousValue.value = inputValue
      } else if (operator.value) {
        const result = performCalculation()
        display.value = String(result)
        previousValue.value = result
      }
      
      waitingForOperand.value = true
      operator.value = nextOperator
    }
    
    // Perform the calculation
    function performCalculation() {
      const inputValue = parseFloat(display.value)
      const prev = previousValue.value
      
      if (prev === null || operator.value === null) {
        return inputValue
      }
      
      let result
      switch (operator.value) {
        case '+':
          result = prev + inputValue
          break
        case '-':
          result = prev - inputValue
          break
        case '*':
          result = prev * inputValue
          break
        case '/':
          result = prev / inputValue
          break
        default:
          result = inputValue
      }
      
      return result
    }
    
    // Calculate and display result
    function calculate() {
      const inputValue = parseFloat(display.value)
      
      if (operator.value && previousValue.value !== null) {
        const actualResult = performCalculation()
        const expression = `${previousValue.value} ${getOperatorSymbol(operator.value)} ${inputValue}`
        
        // Get potentially possessed result
        const displayedResult = getCalculatorResult(
          expression,
          actualResult,
          possessionLevel.value
        )
        
        // Check if result was altered by possession
        const wasIncorrect = displayedResult !== actualResult && typeof displayedResult === 'number'
        
        // Add to history
        const historyEntry = {
          expression,
          actualResult,
          displayedResult,
          wasIncorrect,
          timestamp: Date.now()
        }
        
        history.value.push(historyEntry)
        lastCalculation.value = historyEntry
        
        // Display the result (could be incorrect or demonic symbol)
        display.value = String(displayedResult)
        
        // If this is a second calculation after an incorrect one, show the correction
        if (history.value.length >= 2) {
          const previousEntry = history.value[history.value.length - 2]
          if (previousEntry.wasIncorrect && !wasIncorrect) {
            console.log('[Calculator] Showing correction for previous calculation')
          }
        }
        
        previousValue.value = null
        operator.value = null
        waitingForOperand.value = true
      }
    }
    
    // Get operator symbol for display
    function getOperatorSymbol(op) {
      switch (op) {
        case '+': return '+'
        case '-': return '−'
        case '*': return '×'
        case '/': return '÷'
        default: return op
      }
    }
    
    // Clear all
    function clear() {
      display.value = '0'
      currentValue.value = 0
      previousValue.value = null
      operator.value = null
      waitingForOperand.value = false
    }
    
    // Clear entry
    function clearEntry() {
      display.value = '0'
    }
    
    // Backspace
    function backspace() {
      if (display.value.length > 1) {
        display.value = display.value.slice(0, -1)
      } else {
        display.value = '0'
      }
    }
    
    return {
      display,
      history,
      appendNumber,
      appendDecimal,
      appendOperator,
      calculate,
      clear,
      clearEntry,
      backspace
    }
  }
}
</script>

<style scoped>
.calculator {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: #c0c0c0;
  padding: 8px;
  font-family: 'MS Sans Serif', sans-serif;
}

.calculator-display {
  background: #fff;
  border: 2px inset #808080;
  padding: 8px;
  text-align: right;
  font-size: 24px;
  font-family: 'Courier New', monospace;
  margin-bottom: 8px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: hidden;
}

.calculator-buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  flex: 1;
}

.calculator-buttons button {
  background: #c0c0c0;
  border: 2px outset #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  min-height: 40px;
  font-family: 'MS Sans Serif', sans-serif;
}

.calculator-buttons button:active {
  border-style: inset;
}

.btn-number {
  background: #fff;
}

.btn-zero {
  grid-column: span 2;
}

.btn-operator {
  background: #d4d0c8;
}

.btn-function {
  background: #d4d0c8;
}

.btn-equals {
  background: #0000aa;
  color: #fff;
}

.calculator-history {
  margin-top: 8px;
  padding: 8px;
  background: #fff;
  border: 2px inset #808080;
  font-size: 11px;
  max-height: 100px;
  overflow-y: auto;
}

.history-title {
  font-weight: bold;
  margin-bottom: 4px;
}

.history-entry {
  padding: 2px 0;
  font-family: 'Courier New', monospace;
}

.history-incorrect {
  color: #c00;
}

.history-correction {
  color: #080;
  font-style: italic;
  margin-left: 4px;
}
</style>
