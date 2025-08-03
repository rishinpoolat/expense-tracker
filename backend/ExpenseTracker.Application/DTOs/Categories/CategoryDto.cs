using ExpenseTracker.Core.Enums;

namespace ExpenseTracker.Application.DTOs.Categories
{
    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public ExpenseCategory CategoryType { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}