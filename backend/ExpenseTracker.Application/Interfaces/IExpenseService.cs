using ExpenseTracker.Application.DTOs.Expenses;

namespace ExpenseTracker.Application.Interfaces
{
    public interface IExpenseService
    {
        Task<IEnumerable<ExpenseDto>> GetUserExpensesAsync(Guid userId);
        Task<ExpenseDto?> GetExpenseByIdAsync(int expenseId, Guid userId);
        Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto createExpenseDto, Guid userId);
        Task<ExpenseDto?> UpdateExpenseAsync(UpdateExpenseDto updateExpenseDto, Guid userId);
        Task<bool> DeleteExpenseAsync(int expenseId, Guid userId);
        Task<IEnumerable<ExpenseDto>> GetExpensesByCategoryAsync(int categoryId, Guid userId);
        Task<IEnumerable<ExpenseDto>> GetExpensesByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalExpensesAsync(Guid userId);
        Task<decimal> GetTotalExpensesByCategoryAsync(Guid userId, int categoryId);
    }
}