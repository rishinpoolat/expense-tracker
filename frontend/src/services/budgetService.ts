import { api } from './api';
import type { BudgetStatus } from '../types/budget';

export const budgetService = {
  async getBudgetStatus(): Promise<BudgetStatus> {
    const response = await api.get('/budget/status');
    return response.data;
  },

  async setBudget(amount: number): Promise<void> {
    await api.put('/budget', { amount });
  },

  async clearBudget(): Promise<void> {
    await api.delete('/budget');
  },
};
