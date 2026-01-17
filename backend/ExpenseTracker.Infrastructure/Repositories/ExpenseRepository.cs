using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Core.Interfaces;
using ExpenseTracker.Infrastructure.Data;

namespace ExpenseTracker.Infrastructure.Repositories
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly ApplicationDbContext _context;

        public ExpenseRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Expense>> GetByUserIdAsync(Guid userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && !e.IsDeleted)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }

        public async Task<Expense?> GetByIdAsync(int id, Guid userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId && !e.IsDeleted);
        }

        public async Task<IEnumerable<Expense>> GetByCategoryAsync(int categoryId, Guid userId)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.CategoryId == categoryId && e.UserId == userId && !e.IsDeleted)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Expense>> GetByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            return await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId &&
                           e.ExpenseDate >= startDate &&
                           e.ExpenseDate <= endDate &&
                           !e.IsDeleted)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalAsync(Guid userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId && !e.IsDeleted)
                .SumAsync(e => e.Amount);
        }

        public async Task<decimal> GetTotalByCategoryAsync(Guid userId, int categoryId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId && e.CategoryId == categoryId && !e.IsDeleted)
                .SumAsync(e => e.Amount);
        }

        public async Task<Expense> AddAsync(Expense expense)
        {
            expense.CreatedAt = DateTime.UtcNow;
            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            // Reload with category
            return await _context.Expenses
                .Include(e => e.Category)
                .FirstAsync(e => e.Id == expense.Id);
        }

        public async Task<Expense> UpdateAsync(Expense expense)
        {
            expense.UpdatedAt = DateTime.UtcNow;
            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();

            // Reload with category
            return await _context.Expenses
                .Include(e => e.Category)
                .FirstAsync(e => e.Id == expense.Id);
        }

        public async Task<bool> DeleteAsync(int id, Guid userId)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId && !e.IsDeleted);

            if (expense == null)
            {
                return false;
            }

            // Soft delete
            expense.IsDeleted = true;
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
