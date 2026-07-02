using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FluentValidation;
using ExpenseTracker.Application.DTOs.Budget;
using ExpenseTracker.Application.Interfaces;

namespace ExpenseTracker.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BudgetController : BaseApiController
    {
        private readonly IBudgetService _budgetService;
        private readonly IValidator<SetBudgetDto> _setBudgetValidator;

        public BudgetController(IBudgetService budgetService, IValidator<SetBudgetDto> setBudgetValidator)
        {
            _budgetService = budgetService;
            _setBudgetValidator = setBudgetValidator;
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
            catch (InvalidOperationException ex) when (ex.Message == "User not found")
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while retrieving budget status" });
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
            catch (InvalidOperationException ex) when (ex.Message == "User not found")
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while updating budget" });
            }
        }

        [HttpDelete]
        public async Task<IActionResult> ClearBudget()
        {
            try
            {
                var userId = GetUserId();
                await _budgetService.ClearBudgetAsync(userId);
                return NoContent();
            }
            catch (UnauthorizedAccessException)
            {
                return Unauthorized();
            }
            catch (InvalidOperationException ex) when (ex.Message == "User not found")
            {
                return NotFound(new { message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { message = "An error occurred while clearing budget" });
            }
        }
    }
}
