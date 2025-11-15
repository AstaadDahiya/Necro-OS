import { describe, it, expect, beforeEach } from 'vitest'
import { possessedAppsService } from '../src/utils/possessedAppsService.js'

describe('Possessed Apps Service - Calculator', () => {
  it('should return correct result when possession < 20', () => {
    const result = possessedAppsService.getCalculatorResult('+', 5, 3, 15)
    expect(result).toBe(8)
  })

  it('should return incorrect result 30% of time when possession > 20', () => {
    const results = []
    for (let i = 0; i < 100; i++) {
      const result = possessedAppsService.getCalculatorResult('+', 5, 3, 25)
      results.push(result !== 8)
    }
    
    const incorrectCount = results.filter(Boolean).length
    expect(incorrectCount).toBeGreaterThan(15) // At least 15% incorrect
    expect(incorrectCount).toBeLessThan(45) // At most 45% incorrect
  })

  it('should not show demonic symbol when possession < 60', () => {
    const shouldShow = possessedAppsService.shouldShowDemonicSymbol(50)
    expect(shouldShow).toBe(false)
  })

  it('should show demonic symbol when possession >= 60', () => {
    const shouldShow = possessedAppsService.shouldShowDemonicSymbol(70)
    expect(shouldShow).toBe(true)
  })

  it('should return valid demonic symbol', () => {
    const validSymbols = ['⛧', '☠', '👁', '🕯', '⚰']
    const symbol = possessedAppsService.getDemonicSymbol()
    expect(validSymbols).toContain(symbol)
  })
})

describe('Possessed Apps Service - Clock', () => {
  it('should not run backwards when possession < 30', () => {
    const shouldRun = possessedAppsService.shouldRunBackwards(25)
    expect(shouldRun).toBe(false)
  })

  it('should run backwards when possession >= 30', () => {
    const shouldRun = possessedAppsService.shouldRunBackwards(35)
    expect(shouldRun).toBe(true)
  })

  it('should return backwards duration between 10-30 seconds', () => {
    const duration = possessedAppsService.getBackwardsDuration()
    expect(duration).toBeGreaterThanOrEqual(10000)
    expect(duration).toBeLessThanOrEqual(30000)
  })

  it('should show 3:33 AM between 3:32 and 3:34 AM', () => {
    const time332 = new Date()
    time332.setHours(3, 32, 30)
    expect(possessedAppsService.shouldShow333AM(time332)).toBe(true)
    
    const time333 = new Date()
    time333.setHours(3, 33, 30)
    expect(possessedAppsService.shouldShow333AM(time333)).toBe(true)
    
    const time335 = new Date()
    time335.setHours(3, 35, 0)
    expect(possessedAppsService.shouldShow333AM(time335)).toBe(false)
  })
})

describe('Possessed Apps Service - Task Manager', () => {
  it('should generate 2-5 cursed processes', () => {
    const processes = possessedAppsService.getCursedProcesses(50)
    expect(processes.length).toBeGreaterThanOrEqual(2)
    expect(processes.length).toBeLessThanOrEqual(5)
  })

  it('should use valid cursed process names', () => {
    const validNames = ['soul.exe', 'haunt.dll', 'possession.sys', 'void.exe', 'reaper.dll', 'curse.exe', 'phantom.sys']
    const processes = possessedAppsService.getCursedProcesses(50)
    
    processes.forEach(process => {
      expect(validNames).toContain(process.name)
    })
  })

  it('should generate processes with CPU and memory usage', () => {
    const processes = possessedAppsService.getCursedProcesses(50)
    
    processes.forEach(process => {
      expect(process).toHaveProperty('cpu')
      expect(process).toHaveProperty('memory')
      expect(process.cpu).toBeGreaterThanOrEqual(0)
      expect(process.cpu).toBeLessThanOrEqual(100)
    })
  })
})

describe('Possessed Apps Service - Command Prompt', () => {
  it('should not type autonomously when possession < 40', () => {
    const shouldType = possessedAppsService.shouldTypeAutonomously(35)
    expect(shouldType).toBe(false)
  })

  it('should type autonomously when possession >= 40', () => {
    const shouldType = possessedAppsService.shouldTypeAutonomously(45)
    expect(shouldType).toBe(true)
  })

  it('should return valid autonomous message', () => {
    const validMessages = ['I am here', 'You cannot escape', 'The void watches', 'Your soul is mine', 'There is no escape']
    const message = possessedAppsService.getAutonomousMessage()
    expect(validMessages).toContain(message)
  })

  it('should type message character by character', async () => {
    let output = ''
    const mockElement = {
      textContent: '',
      append: (text) => { output += text }
    }
    
    await possessedAppsService.typeMessage('test', mockElement, 10)
    expect(output).toBe('test')
  })
})
