using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FluentValidation;
using ExpenseTracker.Application.DTOs.Expenses;
using ExpenseTracker.Application.Interfaces;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;
        private readonly IValidator<CreateExpenseDto> _createValidator;
        private readonly IValidator<UpdateExpenseDto> _updateValidator;

        public ExpensesController(
            IExpenseService expenseService,
            IValidator<CreateExpenseDto> createValidator,
            IValidator<UpdateExpenseDto> updateValidator)
        {
            _expenseService = expenseService;
            _createValidator = createValidator;
            _updateValidator = updateValidator;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses()
        {
            try
            {
                var userId = GetUserId();
                var expenses = await _expenseService.GetUserExpensesAsync(userId);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseDto>> GetExpense(int id)
        {
            try
            {
                var userId = GetUserId();
                var expense = await _expenseService.GetExpenseByIdAsync(id, userId);

                if (expense == null)
                {
                    return NotFound(new { message = "Expense not found" });
                }

                return Ok(expense);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> CreateExpense(CreateExpenseDto createExpenseDto)
        {
            try
            {
                // Validate input
                var validationResult = await _createValidator.ValidateAsync(createExpenseDto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = validationResult.Errors.Select(x => x.ErrorMessage)
                    });
                }

                var userId = GetUserId();
                var expense = await _expenseService.CreateExpenseAsync(createExpenseDto, userId);

                return CreatedAtAction(nameof(GetExpense), new { id = expense.Id }, expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while creating the expense" });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ExpenseDto>> UpdateExpense(int id, UpdateExpenseDto updateExpenseDto)
        {
            try
            {
                if (id != updateExpenseDto.Id)
                {
                    return BadRequest(new { message = "ID mismatch" });
                }

                // Validate input
                var validationResult = await _updateValidator.ValidateAsync(updateExpenseDto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = validationResult.Errors.Select(x => x.ErrorMessage)
                    });
                }

                var userId = GetUserId();
                var expense = await _expenseService.UpdateExpenseAsync(updateExpenseDto, userId);

                if (expense == null)
                {
                    return NotFound(new { message = "Expense not found" });
                }

                return Ok(expense);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the expense" });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteExpense(int id)
        {
            try
            {
                var userId = GetUserId();
                var result = await _expenseService.DeleteExpenseAsync(id, userId);

                if (!result)
                {
                    return NotFound(new { message = "Expense not found" });
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the expense" });
            }
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpensesByCategory(int categoryId)
        {
            try
            {
                var userId = GetUserId();
                var expenses = await _expenseService.GetExpensesByCategoryAsync(categoryId, userId);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpensesByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                {
                    return BadRequest(new { message = "Start date cannot be greater than end date" });
                }

                var userId = GetUserId();
                var expenses = await _expenseService.GetExpensesByDateRangeAsync(userId, startDate, endDate);
                return Ok(expenses);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("total")]
        public async Task<ActionResult<decimal>> GetTotalExpenses()
        {
            try
            {
                var userId = GetUserId();
                var total = await _expenseService.GetTotalExpensesAsync(userId);
                return Ok(new { total });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet("total/category/{categoryId}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByCategory(int categoryId)
        {
            try
            {
                var userId = GetUserId();
                var total = await _expenseService.GetTotalExpensesByCategoryAsync(userId, categoryId);
                return Ok(new { total, categoryId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}