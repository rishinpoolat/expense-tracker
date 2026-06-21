namespace ExpenseTracker.Core.Interfaces
{
    public interface IGoogleTokenVerifier
    {
        Task<GoogleUserInfo> VerifyAsync(string idToken, string clientId);
    }

    public class GoogleUserInfo
    {
        public string GoogleId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
    }
}
