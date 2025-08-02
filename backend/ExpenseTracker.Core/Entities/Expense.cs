namespace ExpenseTracker.Core.Entities
{
    public class Expense : BaseEntity
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal Amount { get; set; }
        public DateTime ExpenseDate { get; set; }
        public string? Notes { get; set; }

        // Foreign keys
        public int CategoryId { get; set; }
        public Guid UserId { get; set; }

        // Navigation properties
        public virtual Category Category { get; set; } = null!;
        public virtual User User { get; set; } = null!;
    }
}