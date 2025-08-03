using Microsoft.EntityFrameworkCore;
using AutoMapper;
using ExpenseTracker.Application.DTOs.Expenses;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Infrastructure.Data;
using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Application.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        public ExpenseService(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ExpenseDto>> GetUserExpensesAsync(Guid userId)
        {
            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId && !e.IsDeleted)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto?> GetExpenseByIdAsync(int expenseId, Guid userId)
        {
            var expense = await _context.Expenses
                .Include(e => e.Category)
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId && !e.IsDeleted);

            return expense != null ? _mapper.Map<ExpenseDto>(expense) : null;
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto createExpenseDto, Guid userId)
        {
            // Validate category exists
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == createExpenseDto.CategoryId && !c.IsDeleted);

            if (!categoryExists)
            {
                throw new ArgumentException("Invalid category ID");
            }

            var expense = _mapper.Map<Expense>(createExpenseDto);
            expense.UserId = userId;
            expense.CreatedAt = DateTime.UtcNow;

            _context.Expenses.Add(expense);
            await _context.SaveChangesAsync();

            // Reload with category for response
            var createdExpense = await _context.Expenses
                .Include(e => e.Category)
                .FirstAsync(e => e.Id == expense.Id);

            return _mapper.Map<ExpenseDto>(createdExpense);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(UpdateExpenseDto updateExpenseDto, Guid userId)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == updateExpenseDto.Id && e.UserId == userId && !e.IsDeleted);

            if (expense == null)
            {
                return null;
            }

            // Validate category exists
            var categoryExists = await _context.Categories
                .AnyAsync(c => c.Id == updateExpenseDto.CategoryId && !c.IsDeleted);

            if (!categoryExists)
            {
                throw new ArgumentException("Invalid category ID");
            }

            _mapper.Map(updateExpenseDto, expense);
            expense.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Reload with category for response
            var updatedExpense = await _context.Expenses
                .Include(e => e.Category)
                .FirstAsync(e => e.Id == expense.Id);

            return _mapper.Map<ExpenseDto>(updatedExpense);
        }

        public async Task<bool> DeleteExpenseAsync(int expenseId, Guid userId)
        {
            var expense = await _context.Expenses
                .FirstOrDefaultAsync(e => e.Id == expenseId && e.UserId == userId && !e.IsDeleted);

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

        public async Task<IEnumerable<ExpenseDto>> GetExpensesByCategoryAsync(int categoryId, Guid userId)
        {
            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.CategoryId == categoryId && e.UserId == userId && !e.IsDeleted)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<IEnumerable<ExpenseDto>> GetExpensesByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            var expenses = await _context.Expenses
                .Include(e => e.Category)
                .Where(e => e.UserId == userId &&
                           e.ExpenseDate >= startDate &&
                           e.ExpenseDate <= endDate &&
                           !e.IsDeleted)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<decimal> GetTotalExpensesAsync(Guid userId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId && !e.IsDeleted)
                .SumAsync(e => e.Amount);
        }

        public async Task<decimal> GetTotalExpensesByCategoryAsync(Guid userId, int categoryId)
        {
            return await _context.Expenses
                .Where(e => e.UserId == userId && e.CategoryId == categoryId && !e.IsDeleted)
                .SumAsync(e => e.Amount);
        }
    }
}