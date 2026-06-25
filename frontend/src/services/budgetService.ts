import { api } from './api';
import type { BudgetStatus } from '../types/budget';

export const budgetService = {
  async getBudgetStatus(): Promise<BudgetStatus> {
    const response = await api.get('/budget/status');
    return response.data;
  },

  async setBudget(amount: number | null): Promise<void> {
    await api.put('/budget', { amount });
  },
};
