import { describe, it, expect, beforeEach, vi } from 'vitest'
import { expenseService } from '../../src/services/expenseService'
import type { CreateExpenseDto, UpdateExpenseDto, Expense, Category } from '../../src/types/expense'

// Mock the api module
vi.mock('../../src/services/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { api } from '../../src/services/api'

describe('ExpenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getExpenses', () => {
    it('should fetch all expenses', async () => {
      const mockExpenses: Expense[] = [
        {
          id: 1,
          title: 'Test Expense',
          amount: 100,
          expenseDate: '2023-01-01T00:00:00Z',
          description: 'Test description',
          notes: '',
          categoryId: 1,
          category: { id: 1, name: 'Food' },
          userId: 1,
        },
      ]

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockExpenses })

      const result = await expenseService.getExpenses()

      expect(api.get).toHaveBeenCalledWith('/expenses')
      expect(result).toEqual(mockExpenses)
    })
  })

  describe('getExpenseById', () => {
    it('should fetch expense by id', async () => {
      const mockExpense: Expense = {
        id: 1,
        title: 'Test Expense',
        amount: 100,
        expenseDate: '2023-01-01T00:00:00Z',
        description: 'Test description',
        notes: '',
        categoryId: 1,
        category: { id: 1, name: 'Food' },
        userId: 1,
      }

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockExpense })

      const result = await expenseService.getExpenseById(1)

      expect(api.get).toHaveBeenCalledWith('/expenses/1')
      expect(result).toEqual(mockExpense)
    })
  })

  describe('createExpense', () => {
    it('should create a new expense', async () => {
      const newExpense: CreateExpenseDto = {
        title: 'New Expense',
        amount: 50,
        expenseDate: '2023-01-02T00:00:00Z',
        description: 'New description',
        notes: '',
        categoryId: 1,
      }

      const createdExpense: Expense = {
        id: 2,
        ...newExpense,
        category: { id: 1, name: 'Food' },
        userId: 1,
      }

      vi.mocked(api.post).mockResolvedValueOnce({ data: createdExpense })

      const result = await expenseService.createExpense(newExpense)

      expect(api.post).toHaveBeenCalledWith('/expenses', newExpense)
      expect(result).toEqual(createdExpense)
    })
  })

  describe('updateExpense', () => {
    it('should update an expense', async () => {
      const updateExpense: UpdateExpenseDto = {
        id: 1,
        title: 'Updated Expense',
        amount: 75,
        expenseDate: '2023-01-02T00:00:00Z',
        description: 'Updated description',
        notes: '',
        categoryId: 1,
      }

      const updatedExpense: Expense = {
        ...updateExpense,
        category: { id: 1, name: 'Food' },
        userId: 1,
      }

      vi.mocked(api.put).mockResolvedValueOnce({ data: updatedExpense })

      const result = await expenseService.updateExpense(updateExpense)

      expect(api.put).toHaveBeenCalledWith('/expenses/1', updateExpense)
      expect(result).toEqual(updatedExpense)
    })
  })

  describe('deleteExpense', () => {
    it('should delete an expense', async () => {
      vi.mocked(api.delete).mockResolvedValueOnce({})

      await expenseService.deleteExpense(1)

      expect(api.delete).toHaveBeenCalledWith('/expenses/1')
    })
  })

  describe('getExpensesByCategory', () => {
    it('should fetch expenses by category', async () => {
      const mockExpenses: Expense[] = [
        {
          id: 1,
          title: 'Food Expense',
          amount: 100,
          expenseDate: '2023-01-01T00:00:00Z',
          description: 'Food description',
          notes: '',
          categoryId: 1,
          category: { id: 1, name: 'Food' },
          userId: 1,
        },
      ]

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockExpenses })

      const result = await expenseService.getExpensesByCategory(1)

      expect(api.get).toHaveBeenCalledWith('/expenses/category/1')
      expect(result).toEqual(mockExpenses)
    })
  })

  describe('getExpensesByDateRange', () => {
    it('should fetch expenses by date range', async () => {
      const startDate = '2023-01-01'
      const endDate = '2023-01-31'
      const mockExpenses: Expense[] = [
        {
          id: 1,
          title: 'January Expense',
          amount: 100,
          expenseDate: '2023-01-15T00:00:00Z',
          description: 'January description',
          notes: '',
          categoryId: 1,
          category: { id: 1, name: 'Food' },
          userId: 1,
        },
      ]

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockExpenses })

      const result = await expenseService.getExpensesByDateRange(startDate, endDate)

      expect(api.get).toHaveBeenCalledWith(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`)
      expect(result).toEqual(mockExpenses)
    })
  })

  describe('getTotalExpenses', () => {
    it('should fetch total expenses', async () => {
      const mockTotal = { total: 1000 }
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockTotal })

      const result = await expenseService.getTotalExpenses()

      expect(api.get).toHaveBeenCalledWith('/expenses/total')
      expect(result).toBe(1000)
    })
  })

  describe('getTotalExpensesByCategory', () => {
    it('should fetch total expenses by category', async () => {
      const mockTotal = { total: 500 }
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockTotal })

      const result = await expenseService.getTotalExpensesByCategory(1)

      expect(api.get).toHaveBeenCalledWith('/expenses/total/category/1')
      expect(result).toBe(500)
    })
  })

  describe('getCategories', () => {
    it('should fetch all categories', async () => {
      const mockCategories: Category[] = [
        { id: 1, name: 'Food' },
        { id: 2, name: 'Transport' },
      ]

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockCategories })

      const result = await expenseService.getCategories()

      expect(api.get).toHaveBeenCalledWith('/categories')
      expect(result).toEqual(mockCategories)
    })
  })

  describe('getCategoryById', () => {
    it('should fetch category by id', async () => {
      const mockCategory: Category = { id: 1, name: 'Food' }

      vi.mocked(api.get).mockResolvedValueOnce({ data: mockCategory })

      const result = await expenseService.getCategoryById(1)

      expect(api.get).toHaveBeenCalledWith('/categories/1')
      expect(result).toEqual(mockCategory)
    })
  })
})