import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { exportExpensesToCsv } from '../../src/utils/exportCsv'
import type { Expense } from '../../src/types/expense'

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    title: 'Lunch',
    amount: 12.5,
    expenseDate: '2024-01-15T10:00:00Z',
    description: 'Team lunch',
    categoryId: 1,
    category: { id: 1, name: 'Food', categoryType: 0 },
    userId: 'user-1',
    createdAt: '2024-01-15T10:00:00Z',
    ...overrides,
  }
}

describe('exportExpensesToCsv', () => {
  let mockLink: { href: string; download: string; click: ReturnType<typeof vi.fn> }
  let capturedCsv: string

  beforeEach(() => {
    mockLink = { href: '', download: '', click: vi.fn() }
    capturedCsv = ''

    vi.stubGlobal('Blob', vi.fn().mockImplementation((parts: string[]) => {
      capturedCsv = parts.join('')
      return {}
    }))
    Object.defineProperty(URL, 'createObjectURL', {
      writable: true, configurable: true, value: vi.fn().mockReturnValue('blob:mock'),
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      writable: true, configurable: true, value: vi.fn(),
    })
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLElement)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('triggers a download with the correct default filename', () => {
    const today = new Date().toISOString().split('T')[0]
    exportExpensesToCsv([makeExpense()])
    expect(mockLink.download).toBe(`expenses-${today}.csv`)
    expect(mockLink.click).toHaveBeenCalledOnce()
  })

  it('uses a provided filename', () => {
    exportExpensesToCsv([makeExpense()], 'my-report.csv')
    expect(mockLink.download).toBe('my-report.csv')
  })

  it('includes a UTF-8 BOM for Excel compatibility', () => {
    exportExpensesToCsv([makeExpense()])
    expect(capturedCsv.startsWith('﻿')).toBe(true)
  })

  it('produces the correct header row', () => {
    exportExpensesToCsv([makeExpense()])
    const lines = capturedCsv.replace(/^﻿/, '').split('\r\n')
    expect(lines[0]).toBe('Date,Title,Category,Amount,Description,Notes')
  })

  it('produces a correct data row', () => {
    exportExpensesToCsv([makeExpense()])
    const lines = capturedCsv.replace(/^﻿/, '').split('\r\n')
    expect(lines[1]).toBe('2024-01-15,Lunch,Food,12.5,Team lunch,')
  })

  it('outputs only the header row for an empty array', () => {
    exportExpensesToCsv([])
    const lines = capturedCsv.replace(/^﻿/, '').split('\r\n').filter(Boolean)
    expect(lines).toHaveLength(1)
    expect(lines[0]).toBe('Date,Title,Category,Amount,Description,Notes')
  })

  it('wraps values containing commas in double quotes', () => {
    exportExpensesToCsv([makeExpense({ title: 'Lunch, dinner' })])
    expect(capturedCsv).toContain('"Lunch, dinner"')
  })

  it('escapes double quotes by doubling them', () => {
    exportExpensesToCsv([makeExpense({ title: 'Say "hi"' })])
    expect(capturedCsv).toContain('"Say ""hi"""')
  })

  it('wraps values containing newlines in double quotes', () => {
    exportExpensesToCsv([makeExpense({ description: 'line1\nline2' })])
    expect(capturedCsv).toContain('"line1\nline2"')
  })

  it('wraps values containing carriage returns in double quotes', () => {
    exportExpensesToCsv([makeExpense({ notes: 'line1\rline2' })])
    expect(capturedCsv).toContain('"line1\rline2"')
  })

  it('outputs empty strings for undefined optional fields', () => {
    exportExpensesToCsv([makeExpense({ description: undefined, notes: undefined })])
    const lines = capturedCsv.replace(/^﻿/, '').split('\r\n')
    expect(lines[1]).toMatch(/,,$/)
  })
})
