using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Application.Interfaces
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user);
        DateTime GetTokenExpiration();
    }
}
