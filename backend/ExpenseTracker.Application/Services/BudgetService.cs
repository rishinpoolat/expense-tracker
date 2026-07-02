using Microsoft.AspNetCore.Identity;
using ExpenseTracker.Application.DTOs.Budget;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Core.Interfaces;

namespace ExpenseTracker.Application.Services
{
    public class BudgetService : IBudgetService
    {
        private readonly UserManager<User> _userManager;
        private readonly IExpenseRepository _expenseRepository;

        public BudgetService(UserManager<User> userManager, IExpenseRepository expenseRepository)
        {
            _userManager = userManager;
            _expenseRepository = expenseRepository;
        }

        public async Task<BudgetStatusDto> GetBudgetStatusAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString())
                ?? throw new InvalidOperationException("User not found");

            var now = DateTime.UtcNow;
            var startOfMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Unspecified);
            var endOfMonth = new DateTime(now.Year, now.Month, DateTime.DaysInMonth(now.Year, now.Month), 23, 59, 59, 999, DateTimeKind.Unspecified);

            var monthlyExpenses = await _expenseRepository.GetByDateRangeAsync(userId, startOfMonth, endOfMonth);
            var spent = monthlyExpenses.Sum(e => e.Amount);

            decimal percentage = 0;
            if (user.MonthlyBudget.HasValue && user.MonthlyBudget.Value > 0)
            {
                percentage = Math.Round(spent / user.MonthlyBudget.Value * 100, 2);
            }

            return new BudgetStatusDto
            {
                Budget = user.MonthlyBudget,
                Spent = spent,
                Percentage = percentage,
                IsNearLimit = user.MonthlyBudget.HasValue && percentage >= 90
            };
        }

        public async Task SetBudgetAsync(Guid userId, SetBudgetDto dto)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString())
                ?? throw new InvalidOperationException("User not found");

            user.MonthlyBudget = dto.Amount;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        public async Task ClearBudgetAsync(Guid userId)
        {
            var user = await _userManager.FindByIdAsync(userId.ToString())
                ?? throw new InvalidOperationException("User not found");

            user.MonthlyBudget = null;
            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
                throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }
    }
}
