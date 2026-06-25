using FluentValidation;
using ExpenseTracker.Application.DTOs.Budget;

namespace ExpenseTracker.Application.Validators
{
    public class SetBudgetDtoValidator : AbstractValidator<SetBudgetDto>
    {
        public SetBudgetDtoValidator()
        {
            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Budget must be greater than 0")
                .LessThanOrEqualTo(999999999.99m).WithMessage("Budget amount is too large")
                .When(x => x.Amount.HasValue);
        }
    }
}
