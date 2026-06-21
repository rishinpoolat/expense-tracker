using ExpenseTracker.Core.Entities;

namespace ExpenseTracker.Core.Interfaces
{
    public interface ITokenService
    {
        string GenerateJwtToken(User user);
        DateTime GetTokenExpiration();
    }
}
