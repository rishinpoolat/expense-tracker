using ExpenseTracker.Application.DTOs.Budget;

namespace ExpenseTracker.Application.Interfaces
{
    public interface IBudgetService
    {
        Task<BudgetStatusDto> GetBudgetStatusAsync(Guid userId);
        Task SetBudgetAsync(Guid userId, SetBudgetDto dto);
    }
}
