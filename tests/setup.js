// Test setup file
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock window.dispatchEvent
global.dispatchEvent = vi.fn()

// Mock CustomEvent
global.CustomEvent = class CustomEvent extends Event {
  constructor(event, params) {
    super(event, params)
    this.detail = params?.detail
  }
}
