namespace ExpenseTracker.Application.DTOs.Budget
{
    public class BudgetStatusDto
    {
        public decimal? Budget { get; set; }
        public decimal Spent { get; set; }
        public decimal Percentage { get; set; }
        public bool IsNearLimit { get; set; }
    }
}
