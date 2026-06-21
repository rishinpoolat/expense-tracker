import { beforeAll, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import { expect } from 'vitest'
import * as matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Setup DOM environment
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

// Cleanup after each test
afterEach(() => {
  cleanup()
})