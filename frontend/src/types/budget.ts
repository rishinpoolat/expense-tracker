export interface BudgetStatus {
  budget: number | null;
  spent: number;
  percentage: number;
  isNearLimit: boolean;
}
