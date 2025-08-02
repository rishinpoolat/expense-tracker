using Microsoft.AspNetCore.Identity;

namespace ExpenseTracker.Core.Entities
{
    public class User : IdentityUser<Guid>
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<Expense> Expenses { get; set; } = new List<Expense>();

        // Computed property
        public string FullName => $"{FirstName} {LastName}".Trim();
    }
}