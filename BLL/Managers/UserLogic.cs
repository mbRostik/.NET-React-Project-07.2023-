using BLL.Interfaces;
using DAL.Models;
using DAL.Repositories.Contracts;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace BLL.Managers
{
    public class UserLogic : IUserLogic
    {
        public IUnitOfWork _unitOfWork { get; }
        private readonly IConfiguration _configuration;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;

        public UserLogic(IUnitOfWork unitOfWork, IConfiguration configuration, UserManager<User> userManager, SignInManager<User> signInManager) 
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        public async Task<UserWithToken> LoginUser(User_Model user)
        {           
            User temp = null;
            temp = await _userManager.FindByEmailAsync(user.Email);

            if (temp == null)
                return null;

            var check = await _signInManager.PasswordSignInAsync(temp.UserName, user.Password, true, true);

            if (!check.Succeeded)
                return null;

            UserWithToken userWithToken = new UserWithToken(temp);

            if (temp != null)
            {
                RefreshToken refreshToken = GenerateRefreshToken();

                temp.RefreshTokens.Add(refreshToken);
                await _unitOfWork.databaseContext.SaveChangesAsync();

                userWithToken = new UserWithToken(temp);
                userWithToken.RefreshToken = refreshToken.Token;
            }

            if (userWithToken == null)
                return null;

            userWithToken.AccessToken = GenerateAccessToken(temp.Id);

            return userWithToken;
        }

        public async Task<string> Registration(User_Model user)
        {
            var newUser = new User { UserName = user.Name, Email = user.Email, Avatar = user.Avatar };
            var result = await _userManager.CreateAsync(newUser, user.Password);

            if (!result.Succeeded)
            {
                return result.Errors.First().Description;
            }

            await _userManager.AddToRoleAsync(newUser, "USER");

            return "OK";
        }

        public async Task<bool> DeleteRefreshToken(string refreshToken)
        {
            var token = await FindToken(refreshToken);

            if (token == null)
                return false;

            _unitOfWork.databaseContext.refreshTokens.Remove(token);
            await _unitOfWork.databaseContext.SaveChangesAsync();
            return true;
        }

        public async Task<bool> CheckRefreshToken(string token)
        {
            if (_unitOfWork.databaseContext.refreshTokens.FirstOrDefault(e => e.Token == token) != null)
            {
                var sho = _unitOfWork.databaseContext.refreshTokens.FirstOrDefault(m => m.Token == token);
                if (sho.ExpiryDate > DateTime.UtcNow)
                    return true;

                _unitOfWork.databaseContext.refreshTokens.Remove(sho);
                await _unitOfWork.databaseContext.SaveChangesAsync();
                return false;
            }

            return false;
        }

        public async Task<string> CheckAndGiveAccessToken(string reft, string acc)
        {
            string token = acc;
            string refresht = reft;           

            var tokenHandler = new JwtSecurityTokenHandler();

            var temp = tokenHandler.ReadToken(token) as JwtSecurityToken;

            if (temp.ValidTo < DateTime.UtcNow)
            {
                var refreshToken = _unitOfWork.databaseContext.refreshTokens.FirstOrDefault(e => e.Token == refresht);
                return GenerateAccessToken(refreshToken.UserId);
            }
            
            return null;
        }

        public string GenerateAccessToken(string userId)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSecurityKey"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, Convert.ToString(userId))
                }),
                Expires = DateTime.UtcNow.AddDays(7),                
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<RefreshToken> FindToken(string token)
        {
            return await _unitOfWork.databaseContext.refreshTokens.FirstOrDefaultAsync(t => t.Token == token);
        }

        public RefreshToken GenerateRefreshToken()
        {
            RefreshToken refreshToken = new RefreshToken();

            var randomNumber = new byte[32];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomNumber);

                var base64String = Convert.ToBase64String(randomNumber);

                var sanitizedToken = base64String.Replace("+", "");

                refreshToken.Token = sanitizedToken;
            }

            refreshToken.ExpiryDate = DateTime.UtcNow.AddMonths(6);
            return refreshToken;
        }

        public async Task<User> GetUserFromAccessToken(string accessToken)
        {
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_configuration["JwtSecurityKey"]);

                var tokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };

                SecurityToken securityToken;
                var principle = tokenHandler.ValidateToken(accessToken, tokenValidationParameters, out securityToken);

                JwtSecurityToken jwtSecurityToken = securityToken as JwtSecurityToken;

                if (jwtSecurityToken != null && jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                {
                    var userId = principle.FindFirst(ClaimTypes.Name)?.Value;

                    return await _userManager.FindByIdAsync(userId);
                }
            }

            catch (Exception)
            {
                return new User();
            }

            return new User();
        }

        public async Task<bool> ChangeName(string accesstoken, string name)
        {
            var model = await GetUserFromAccessToken(accesstoken);

            if (model.Email == null)
                return false;

            model.UserName = name;
            model.NormalizedUserName = name.ToUpper();

            _unitOfWork.databaseContext.users.Update(model);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangePassword(string token,string oldPassword, string newPassword)
        {
            var model = await GetUserFromAccessToken(token);

            if (model.Email == null)
                return false;

            var check = await _signInManager.PasswordSignInAsync(model.UserName, oldPassword, true, true);

            if (!check.Succeeded)
                return false;

            await _userManager.ChangePasswordAsync(model, oldPassword, newPassword);

            return true;
        }

        public async Task<bool> ChangeAvatar(string xAuthAccessToken, byte[] byteavatar)
        {
            var user = await GetUserFromAccessToken(xAuthAccessToken);

            if (user.Email == null)
                return false;

            user.Avatar = byteavatar;

            _unitOfWork.databaseContext.users.Update(user);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<User> GetUserById(string id)
        {
            var user = await _userManager.FindByIdAsync(id);

            return user;
        }

        public async Task<bool> IsSubscribed(string xAuthAccessToken, string userid)
        {
            var user = await GetUserFromAccessToken(xAuthAccessToken);

            var result = await _unitOfWork.FollowRepository.IsSubscribed(userid, user.Id);

            return result;
        }

        public async Task<bool> Follow(string xAuthAccessToken, string userid)
        {
            var user = await GetUserFromAccessToken(xAuthAccessToken);

            var result = await _unitOfWork.FollowRepository.Follow(userid, user.Id);

            return result;
        }

        public async Task<int> GetCountFollowers(string userid)
        {
            var count = await _unitOfWork.FollowRepository.CountOfFollowers(userid);

            return count;
        }
    }
}
