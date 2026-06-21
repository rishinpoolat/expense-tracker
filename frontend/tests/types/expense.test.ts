import { describe, it, expect } from 'vitest'
import type { Expense, CreateExpenseDto, UpdateExpenseDto, Category } from '../../src/types/expense'

describe('Expense Types', () => {
  describe('Category', () => {
    it('should have correct structure', () => {
      const category: Category = {
        id: 1,
        name: 'Food',
      }

      expect(category.id).toBe(1)
      expect(category.name).toBe('Food')
      expect(Object.keys(category)).toEqual(['id', 'name'])
    })
  })

  describe('CreateExpenseDto', () => {
    it('should have correct structure', () => {
      const createExpense: CreateExpenseDto = {
        title: 'Lunch',
        description: 'Lunch at restaurant',
        amount: 25.50,
        expenseDate: '2023-01-15T12:00:00Z',
        notes: 'Business lunch',
        categoryId: 1,
      }

      expect(createExpense.title).toBe('Lunch')
      expect(createExpense.description).toBe('Lunch at restaurant')
      expect(createExpense.amount).toBe(25.50)
      expect(createExpense.expenseDate).toBe('2023-01-15T12:00:00Z')
      expect(createExpense.notes).toBe('Business lunch')
      expect(createExpense.categoryId).toBe(1)
      expect(Object.keys(createExpense)).toEqual(['title', 'description', 'amount', 'expenseDate', 'notes', 'categoryId'])
    })

    it('should handle optional fields', () => {
      const createExpense: CreateExpenseDto = {
        title: 'Lunch',
        amount: 25.50,
        expenseDate: '2023-01-15T12:00:00Z',
        categoryId: 1,
      }

      expect(createExpense.title).toBe('Lunch')
      expect(createExpense.amount).toBe(25.50)
      expect(createExpense.description).toBeUndefined()
      expect(createExpense.notes).toBeUndefined()
    })
  })

  describe('UpdateExpenseDto', () => {
    it('should have correct structure with id', () => {
      const updateExpense: UpdateExpenseDto = {
        id: 1,
        title: 'Updated Lunch',
        description: 'Updated lunch description',
        amount: 30.00,
        expenseDate: '2023-01-15T12:00:00Z',
        notes: 'Updated notes',
        categoryId: 2,
      }

      expect(updateExpense.id).toBe(1)
      expect(updateExpense.title).toBe('Updated Lunch')
      expect(updateExpense.description).toBe('Updated lunch description')
      expect(updateExpense.amount).toBe(30.00)
      expect(updateExpense.expenseDate).toBe('2023-01-15T12:00:00Z')
      expect(updateExpense.notes).toBe('Updated notes')
      expect(updateExpense.categoryId).toBe(2)
    })
  })

  describe('Expense', () => {
    it('should have correct structure', () => {
      const expense: Expense = {
        id: 1,
        title: 'Lunch',
        description: 'Lunch at restaurant',
        amount: 25.50,
        expenseDate: '2023-01-15T12:00:00Z',
        notes: 'Business lunch',
        categoryId: 1,
        category: {
          id: 1,
          name: 'Food',
        },
        userId: 123,
      }

      expect(expense.id).toBe(1)
      expect(expense.title).toBe('Lunch')
      expect(expense.description).toBe('Lunch at restaurant')
      expect(expense.amount).toBe(25.50)
      expect(expense.expenseDate).toBe('2023-01-15T12:00:00Z')
      expect(expense.notes).toBe('Business lunch')
      expect(expense.categoryId).toBe(1)
      expect(expense.category.id).toBe(1)
      expect(expense.category.name).toBe('Food')
      expect(expense.userId).toBe(123)
    })

    it('should handle optional fields', () => {
      const expense: Expense = {
        id: 1,
        title: 'Lunch',
        amount: 25.50,
        expenseDate: '2023-01-15T12:00:00Z',
        categoryId: 1,
        category: {
          id: 1,
          name: 'Food',
        },
        userId: 123,
      }

      expect(expense.description).toBeUndefined()
      expect(expense.notes).toBeUndefined()
    })
  })
})