using Google.Apis.Auth;
using ExpenseTracker.Core.Interfaces;

namespace ExpenseTracker.Infrastructure.Services
{
    public class GoogleTokenVerifier : IGoogleTokenVerifier
    {
        public async Task<GoogleUserInfo> VerifyAsync(string idToken, string clientId)
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { clientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);

            return new GoogleUserInfo
            {
                GoogleId = payload.Subject,
                Email = payload.Email,
                FirstName = payload.GivenName ?? string.Empty,
                LastName = payload.FamilyName ?? string.Empty
            };
        }
    }
}
