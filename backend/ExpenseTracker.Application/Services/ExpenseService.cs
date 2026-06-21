using AutoMapper;
using ExpenseTracker.Application.DTOs.Expenses;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Core.Interfaces;

namespace ExpenseTracker.Application.Services
{
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly ICategoryRepository _categoryRepository;
        private readonly IMapper _mapper;

        public ExpenseService(
            IExpenseRepository expenseRepository,
            ICategoryRepository categoryRepository,
            IMapper mapper)
        {
            _expenseRepository = expenseRepository;
            _categoryRepository = categoryRepository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ExpenseDto>> GetUserExpensesAsync(Guid userId)
        {
            var expenses = await _expenseRepository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<ExpenseDto?> GetExpenseByIdAsync(int expenseId, Guid userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(expenseId, userId);
            return expense != null ? _mapper.Map<ExpenseDto>(expense) : null;
        }

        public async Task<ExpenseDto> CreateExpenseAsync(CreateExpenseDto createExpenseDto, Guid userId)
        {
            // Validate category exists
            var categoryExists = await _categoryRepository.ExistsAsync(createExpenseDto.CategoryId);
            if (!categoryExists)
            {
                throw new ArgumentException("Invalid category ID");
            }

            var expense = _mapper.Map<Expense>(createExpenseDto);
            expense.UserId = userId;

            var createdExpense = await _expenseRepository.AddAsync(expense);
            return _mapper.Map<ExpenseDto>(createdExpense);
        }

        public async Task<ExpenseDto?> UpdateExpenseAsync(UpdateExpenseDto updateExpenseDto, Guid userId)
        {
            var expense = await _expenseRepository.GetByIdAsync(updateExpenseDto.Id, userId);
            if (expense == null)
            {
                return null;
            }

            // Validate category exists
            var categoryExists = await _categoryRepository.ExistsAsync(updateExpenseDto.CategoryId);
            if (!categoryExists)
            {
                throw new ArgumentException("Invalid category ID");
            }

            _mapper.Map(updateExpenseDto, expense);
            var updatedExpense = await _expenseRepository.UpdateAsync(expense);
            return _mapper.Map<ExpenseDto>(updatedExpense);
        }

        public async Task<bool> DeleteExpenseAsync(int expenseId, Guid userId)
        {
            return await _expenseRepository.DeleteAsync(expenseId, userId);
        }

        public async Task<IEnumerable<ExpenseDto>> GetExpensesByCategoryAsync(int categoryId, Guid userId)
        {
            var expenses = await _expenseRepository.GetByCategoryAsync(categoryId, userId);
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<IEnumerable<ExpenseDto>> GetExpensesByDateRangeAsync(Guid userId, DateTime startDate, DateTime endDate)
        {
            var expenses = await _expenseRepository.GetByDateRangeAsync(userId, startDate, endDate);
            return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
        }

        public async Task<decimal> GetTotalExpensesAsync(Guid userId)
        {
            return await _expenseRepository.GetTotalAsync(userId);
        }

        public async Task<decimal> GetTotalExpensesByCategoryAsync(Guid userId, int categoryId)
        {
            return await _expenseRepository.GetTotalByCategoryAsync(userId, categoryId);
        }
    }
}
