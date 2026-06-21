using FluentValidation;
using ExpenseTracker.Application.DTOs.Expenses;

namespace ExpenseTracker.Application.Validators
{
    public class CreateExpenseDtoValidator : AbstractValidator<CreateExpenseDto>
    {
        public CreateExpenseDtoValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required")
                .MaximumLength(200).WithMessage("Title cannot exceed 200 characters");

            RuleFor(x => x.Amount)
                .GreaterThan(0).WithMessage("Amount must be greater than 0")
                .LessThanOrEqualTo(999999.99m).WithMessage("Amount cannot exceed 999,999.99");

            RuleFor(x => x.ExpenseDate)
                .NotEmpty().WithMessage("Expense date is required")
                .LessThanOrEqualTo(DateTime.Now).WithMessage("Expense date cannot be in the future");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0).WithMessage("Please select a valid category");

            RuleFor(x => x.Description)
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Description));

            RuleFor(x => x.Notes)
                .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters")
                .When(x => !string.IsNullOrEmpty(x.Notes));
        }
    }
}