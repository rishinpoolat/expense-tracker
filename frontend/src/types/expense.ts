export interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  categoryId: number;
  userId: string;
  category: Category;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  categoryType: number;
}

export interface CreateExpenseDto {
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  categoryId: number;
}

export interface UpdateExpenseDto {
  id: number;
  title: string;
  description?: string;
  amount: number;
  expenseDate: string;
  notes?: string;
  categoryId: number;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  period?: 'week' | 'month' | 'year';
}