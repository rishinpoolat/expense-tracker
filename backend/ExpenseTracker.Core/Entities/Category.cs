using ExpenseTracker.Core.Enums;

namespace ExpenseTracker.Core.Entities
{
    public class Category : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ExpenseCategory CategoryType { get; set; }

        // Navigation properties
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    }
}