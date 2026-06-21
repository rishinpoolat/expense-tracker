using Microsoft.AspNetCore.Identity;
using AutoMapper;
using Microsoft.Extensions.Configuration;
using ExpenseTracker.Application.DTOs.Auth;
using ExpenseTracker.Application.Interfaces;
using ExpenseTracker.Core.Entities;
using ExpenseTracker.Core.Interfaces;

namespace ExpenseTracker.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly IGoogleTokenVerifier _googleTokenVerifier;
        private readonly IMapper _mapper;
        private readonly string _googleClientId;

        public AuthService(
            UserManager<User> userManager,
            ITokenService tokenService,
            IGoogleTokenVerifier googleTokenVerifier,
            IMapper mapper,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _googleTokenVerifier = googleTokenVerifier;
            _mapper = mapper;
            _googleClientId = configuration["Google:ClientId"] ?? string.Empty;
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                // Check if user already exists
                if (await UserExistsAsync(registerDto.Email))
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "User with this email already exists"
                    };
                }

                // Create user entity
                var user = _mapper.Map<User>(registerDto);
                user.UserName = registerDto.Email;

                // Create user
                var result = await _userManager.CreateAsync(user, registerDto.Password);

                if (!result.Succeeded)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = string.Join(", ", result.Errors.Select(x => x.Description))
                    };
                }

                // Generate token
                var token = _tokenService.GenerateJwtToken(user);
                var userDto = _mapper.Map<UserDto>(user);

                return new AuthResponseDto
                {
                    Success = true,
                    Token = token,
                    ExpiresAt = _tokenService.GetTokenExpiration(),
                    User = userDto,
                    Message = "Registration successful"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Registration failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            try
            {
                // Find user
                var user = await _userManager.FindByEmailAsync(loginDto.Email);
                if (user == null)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    };
                }

                // Check password using UserManager instead of SignInManager
                var isPasswordValid = await _userManager.CheckPasswordAsync(user, loginDto.Password);
                if (!isPasswordValid)
                {
                    return new AuthResponseDto
                    {
                        Success = false,
                        Message = "Invalid email or password"
                    };
                }

                // Generate token
                var token = _tokenService.GenerateJwtToken(user);
                var userDto = _mapper.Map<UserDto>(user);

                return new AuthResponseDto
                {
                    Success = true,
                    Token = token,
                    ExpiresAt = _tokenService.GetTokenExpiration(),
                    User = userDto,
                    Message = "Login successful"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Login failed: {ex.Message}"
                };
            }
        }

        public async Task<AuthResponseDto> GoogleLoginAsync(GoogleLoginDto googleLoginDto)
        {
            try
            {
                var googleUser = await _googleTokenVerifier.VerifyAsync(googleLoginDto.IdToken, _googleClientId);

                // 1. Already linked to this Google account?
                var user = await _userManager.FindByLoginAsync("Google", googleUser.GoogleId);

                if (user == null)
                {
                    // 2. Existing password account with the same email?
                    user = await _userManager.FindByEmailAsync(googleUser.Email);

                    if (user != null)
                    {
                        // Auto-link Google to the existing account
                        var linkResult = await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", googleUser.GoogleId, "Google"));
                        if (!linkResult.Succeeded)
                        {
                            return new AuthResponseDto
                            {
                                Success = false,
                                Message = string.Join(", ", linkResult.Errors.Select(e => e.Description))
                            };
                        }
                    }
                    else
                    {
                        // 3. New user — create without password
                        user = new User
                        {
                            UserName = googleUser.Email,
                            Email = googleUser.Email,
                            FirstName = googleUser.FirstName,
                            LastName = googleUser.LastName,
                            EmailConfirmed = true
                        };

                        var createResult = await _userManager.CreateAsync(user);
                        if (!createResult.Succeeded)
                        {
                            return new AuthResponseDto
                            {
                                Success = false,
                                Message = string.Join(", ", createResult.Errors.Select(e => e.Description))
                            };
                        }

                        await _userManager.AddLoginAsync(user, new UserLoginInfo("Google", googleUser.GoogleId, "Google"));
                    }
                }

                var token = _tokenService.GenerateJwtToken(user);
                var userDto = _mapper.Map<UserDto>(user);

                return new AuthResponseDto
                {
                    Success = true,
                    Token = token,
                    ExpiresAt = _tokenService.GetTokenExpiration(),
                    User = userDto,
                    Message = "Login successful"
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDto
                {
                    Success = false,
                    Message = $"Google login failed: {ex.Message}"
                };
            }
        }

        public async Task<bool> UserExistsAsync(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return user != null;
        }
    }
}
