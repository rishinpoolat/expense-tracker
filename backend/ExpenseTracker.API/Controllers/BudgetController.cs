using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using FluentValidation;
using ExpenseTracker.Application.DTOs.Budget;
using ExpenseTracker.Application.Interfaces;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BudgetController : ControllerBase
    {
        private readonly IBudgetService _budgetService;
        private readonly IValidator<SetBudgetDto> _setBudgetValidator;

        public BudgetController(IBudgetService budgetService, IValidator<SetBudgetDto> setBudgetValidator)
        {
            _budgetService = budgetService;
            _setBudgetValidator = setBudgetValidator;
        }

        private Guid GetUserId()
        {
            var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.Parse(userIdClaim ?? throw new UnauthorizedAccessException("User ID not found"));
        }

        [HttpGet("status")]
        public async Task<ActionResult<BudgetStatusDto>> GetBudgetStatus()
        {
            try
            {
                var userId = GetUserId();
                var status = await _budgetService.GetBudgetStatusAsync(userId);
                return Ok(status);
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPut]
        public async Task<IActionResult> SetBudget([FromBody] SetBudgetDto dto)
        {
            try
            {
                var validationResult = await _setBudgetValidator.ValidateAsync(dto);
                if (!validationResult.IsValid)
                {
                    return BadRequest(new
                    {
                        message = "Validation failed",
                        errors = validationResult.Errors.Select(x => x.ErrorMessage)
                    });
                }

                var userId = GetUserId();
                await _budgetService.SetBudgetAsync(userId, dto);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }
    }
}
