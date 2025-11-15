/**
 * Visual Effects Batcher
 * 
 * Batches visual effect updates using requestAnimationFrame for optimal performance.
 * Prevents layout thrashing by grouping DOM reads and writes.
 */

class VisualEffectsBatcher {
  constructor() {
    this.pendingEffects = []
    this.rafId = null
    this.isProcessing = false
    this.frameCount = 0
    this.lastFrameTime = performance.now()
    this.fps = 60
  }

  /**
   * Schedule a visual effect to be applied on the next animation frame
   * @param {Function} effectFn - Function that applies the visual effect
   * @param {number} priority - Priority level (lower = higher priority)
   */
  scheduleEffect(effectFn, priority = 0) {
    this.pendingEffects.push({
      fn: effectFn,
      priority,
      timestamp: performance.now()
    })

    // Sort by priority (lower number = higher priority)
    this.pendingEffects.sort((a, b) => a.priority - b.priority)

    // Schedule processing if not already scheduled
    if (!this.rafId) {
      this.rafId = requestAnimationFrame(() => this.processEffects())
    }
  }

  /**
   * Process all pending effects in a single animation frame
   */
  processEffects() {
    if (this.isProcessing) return

    this.isProcessing = true
    const startTime = performance.now()

    // Calculate FPS
    const deltaTime = startTime - this.lastFrameTime
    this.fps = 1000 / deltaTime
    this.frameCount++
    this.lastFrameTime = startTime

    // Process all pending effects
    const effects = [...this.pendingEffects]
    this.pendingEffects = []

    // Separate read and write operations to prevent layout thrashing
    const readOperations = []
    const writeOperations = []

    effects.forEach(effect => {
      try {
        const result = effect.fn()
        
        // If the effect returns an object with read/write operations, separate them
        if (result && typeof result === 'object') {
          if (result.read) readOperations.push(result.read)
          if (result.write) writeOperations.push(result.write)
        }
      } catch (error) {
        console.error('[VisualEffectsBatcher] Error processing effect:', error)
      }
    })

    // Execute all read operations first
    const readResults = readOperations.map(readFn => {
      try {
        return readFn()
      } catch (error) {
        console.error('[VisualEffectsBatcher] Error in read operation:', error)
        return null
      }
    })

    // Then execute all write operations
    writeOperations.forEach((writeFn, index) => {
      try {
        writeFn(readResults[index])
      } catch (error) {
        console.error('[VisualEffectsBatcher] Error in write operation:', error)
      }
    })

    const processingTime = performance.now() - startTime

    // Log performance metrics every 60 frames
    if (this.frameCount % 60 === 0) {
      console.log(`[VisualEffectsBatcher] Processed ${effects.length} effects in ${processingTime.toFixed(2)}ms (FPS: ${this.fps.toFixed(1)})`)
    }

    this.rafId = null
    this.isProcessing = false

    // If more effects were added during processing, schedule another frame
    if (this.pendingEffects.length > 0) {
      this.rafId = requestAnimationFrame(() => this.processEffects())
    }
  }

  /**
   * Schedule a DOM read operation
   * @param {Function} readFn - Function that reads from DOM
   * @returns {Promise} Promise that resolves with the read value
   */
  scheduleRead(readFn) {
    return new Promise((resolve) => {
      this.scheduleEffect(() => {
        return {
          read: readFn,
          write: (result) => resolve(result)
        }
      }, 0) // High priority for reads
    })
  }

  /**
   * Schedule a DOM write operation
   * @param {Function} writeFn - Function that writes to DOM
   * @returns {Promise} Promise that resolves when write is complete
   */
  scheduleWrite(writeFn) {
    return new Promise((resolve) => {
      this.scheduleEffect(() => {
        writeFn()
        resolve()
      }, 1) // Lower priority for writes
    })
  }

  /**
   * Schedule a read-then-write operation (common pattern)
   * @param {Function} readFn - Function that reads from DOM
   * @param {Function} writeFn - Function that writes to DOM using read result
   * @returns {Promise} Promise that resolves when operation is complete
   */
  scheduleReadWrite(readFn, writeFn) {
    return new Promise((resolve) => {
      this.scheduleEffect(() => {
        return {
          read: readFn,
          write: (result) => {
            writeFn(result)
            resolve()
          }
        }
      }, 0)
    })
  }

  /**
   * Batch multiple effects together
   * @param {Array<Function>} effects - Array of effect functions
   * @param {number} priority - Priority for the batch
   */
  batchEffects(effects, priority = 0) {
    this.scheduleEffect(() => {
      effects.forEach(effectFn => {
        try {
          effectFn()
        } catch (error) {
          console.error('[VisualEffectsBatcher] Error in batched effect:', error)
        }
      })
    }, priority)
  }

  /**
   * Clear all pending effects
   */
  clearPendingEffects() {
    this.pendingEffects = []
    if (this.rafId) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    console.log('[VisualEffectsBatcher] Cleared all pending effects')
  }

  /**
   * Get current FPS
   * @returns {number} Current frames per second
   */
  getFPS() {
    return this.fps
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getMetrics() {
    return {
      fps: this.fps,
      frameCount: this.frameCount,
      pendingEffects: this.pendingEffects.length,
      isProcessing: this.isProcessing
    }
  }
}

// Export singleton instance
export const visualEffectsBatcher = new VisualEffectsBatcher()

// Export helper functions for common use cases

/**
 * Apply a visual effect on the next frame
 * @param {Function} effectFn - Effect function to apply
 */
export function applyEffect(effectFn) {
  visualEffectsBatcher.scheduleEffect(effectFn)
}

/**
 * Read from DOM on the next frame
 * @param {Function} readFn - Function that reads from DOM
 * @returns {Promise} Promise with read value
 */
export function readDOM(readFn) {
  return visualEffectsBatcher.scheduleRead(readFn)
}

/**
 * Write to DOM on the next frame
 * @param {Function} writeFn - Function that writes to DOM
 * @returns {Promise} Promise that resolves when complete
 */
export function writeDOM(writeFn) {
  return visualEffectsBatcher.scheduleWrite(writeFn)
}

/**
 * Perform read-then-write operation
 * @param {Function} readFn - Function that reads from DOM
 * @param {Function} writeFn - Function that writes to DOM
 * @returns {Promise} Promise that resolves when complete
 */
export function readWriteDOM(readFn, writeFn) {
  return visualEffectsBatcher.scheduleReadWrite(readFn, writeFn)
}

/**
 * Batch multiple effects together
 * @param {Array<Function>} effects - Array of effect functions
 */
export function batchEffects(effects) {
  visualEffectsBatcher.batchEffects(effects)
}
