import { describe, it, expect, beforeEach, vi } from 'vitest'
import { budgetService } from '../../src/services/budgetService'

vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { api } from '../../src/services/api'

describe('budgetService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getBudgetStatus', () => {
    it('should call GET /budget/status and return the response', async () => {
      const mockStatus = { budget: 1000, spent: 500, percentage: 50, isNearLimit: false }
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockStatus })

      const result = await budgetService.getBudgetStatus()

      expect(api.get).toHaveBeenCalledWith('/budget/status')
      expect(result).toEqual(mockStatus)
    })

    it('should return isNearLimit: true when percentage >= 90', async () => {
      const mockStatus = { budget: 1000, spent: 950, percentage: 95, isNearLimit: true }
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockStatus })

      const result = await budgetService.getBudgetStatus()

      expect(result.isNearLimit).toBe(true)
    })
  })

  describe('setBudget', () => {
    it('should call PUT /budget with the given amount', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({})

      await budgetService.setBudget(1500)

      expect(api.put).toHaveBeenCalledWith('/budget', { amount: 1500 })
    })
  })

  describe('clearBudget', () => {
    it('should call DELETE /budget', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({})

      await budgetService.clearBudget()

      expect(api.delete).toHaveBeenCalledWith('/budget')
    })
  })
})
