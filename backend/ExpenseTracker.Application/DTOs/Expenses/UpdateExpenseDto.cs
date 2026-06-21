namespace ExpenseTracker.Application.DTOs.Expenses
{
    public class UpdateExpenseDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? Notes { get; set; }
        public int CategoryId { get; set; }
    }
}