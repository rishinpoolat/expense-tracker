using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Interfaces
{
    public interface IExpenseRepository
    {
        Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId);
        Task<Expense?> GetByIdAsync(int id, Guid userId);
        Task<IEnumerable<Expense>> GetByCategoryAsync(int categoryId, Guid userId);
        Task<IEnumerable<Expense>> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalAsync(Guid userId);
        Task<decimal> GetTotalByCategoryAsync(Guid userId, int categoryId);
        Task<Expense> AddAsync(Expense expense);
        Task<Expense> UpdateAsync(Expense expense);
        Task<bool> DeleteAsync(int id, Guid userId);
    }
}
