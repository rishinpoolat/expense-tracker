import { api } from './api';
import type { Expense, CreateExpenseDto, UpdateExpenseDto, Category } from '../types/expense';

export const expenseService = {
  // Expense operations
  async getExpenses(): Promise<Expense[]> {
    const response = await api.get('/expenses');
    return response.data;
  },

  async getExpenseById(id: number): Promise<Expense> {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  async createExpense(expense: CreateExpenseDto): Promise<Expense> {
    const response = await api.post('/expenses', expense);
    return response.data;
  },

  async updateExpense(expense: UpdateExpenseDto): Promise<Expense> {
    const response = await api.put(`/expenses/${expense.id}`, expense);
    return response.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },

  async getExpensesByCategory(categoryId: number): Promise<Expense[]> {
    const response = await api.get(`/expenses/category/${categoryId}`);
    return response.data;
  },

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const response = await api.get(`/expenses/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  async getTotalExpenses(): Promise<number> {
    const response = await api.get('/expenses/total');
    return response.data.total;
  },

  async getTotalExpensesByCategory(categoryId: number): Promise<number> {
    const response = await api.get(`/expenses/total/category/${categoryId}`);
    return response.data.total;
  },

  // Category operations
  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  },

  async getCategoryById(id: number): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }
};