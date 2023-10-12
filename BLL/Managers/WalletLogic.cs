using BLL.Interfaces;
using DAL.Models;
using DAL.Repositories;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace BLL.Managers
{
    public class WalletLogic : IWalletLogic
    {
        public IUnitOfWork _unitOfWork { get; }
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public WalletLogic(IUnitOfWork unitOfWork, UserManager<User> userManager, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _configuration = configuration;
        }
        public async Task<bool> BuyCoin(string xAuthAccessToken, WalletForReact model)
        {
            try
            {
                float count = model.Count;

                var user = await GetUserFromAccessToken(xAuthAccessToken);

                if (user.Email == null)
                    return false;

                Wallet temp = new Wallet();

                temp.UserId = user.Id;
                temp.CoinId = model.CoinId;
                temp.Count = count;

                try
                {
                    var tem = await _unitOfWork.WalletRepository.GetAllByIdAsync(user.Id);

                    foreach (var smth in tem)
                    {
                        if (smth.CoinId == temp.CoinId)
                        {
                            smth.Count += temp.Count;

                            await _unitOfWork.WalletRepository.UpdateAsync(smth);
                            await _unitOfWork.SaveChangesAsync();
                            return true;
                        }
                    }

                    await _unitOfWork.WalletRepository.AddAsync(temp);
                    await _unitOfWork.SaveChangesAsync();
                    return true;
                }

                catch
                {
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public async Task<bool> SellCoin(string xAuthAccessToken, WalletForReact model)
        {
            try
            {
                float count = model.Count;

                var user = await GetUserFromAccessToken(xAuthAccessToken);

                if (user.Email == null)
                    return false;

                Wallet temp = new Wallet();

                temp.UserId = user.Id;
                temp.CoinId = model.CoinId;
                temp.Count = count;

                try
                {
                    var tem = await _unitOfWork.WalletRepository.GetAllByIdAsync(user.Id);

                    foreach (var smth in tem)
                    {
                        if (smth.CoinId == temp.CoinId)
                        {
                            if (count <= smth.Count)
                            {
                                smth.Count -= temp.Count;

                                await _unitOfWork.WalletRepository.UpdateAsync(smth);
                                await _unitOfWork.SaveChangesAsync();
                                return true;
                            }
                            else
                            {
                                return false;
                            }
                        }
                    }

                    return true;
                }

                catch
                {
                    return false;
                }
            }
            catch
            {
                return false;
            }
        }

        public async Task<List<WalletForReact>> GetAllWallets(string accessToken, QueryStringParameters queryStringParameters)
        {
            var user = await GetUserFromAccessToken(accessToken);

            if (user.Email == null)
                return null;

            var result = await _unitOfWork.WalletRepository.GetPaggedByIdForReactAsync(user.Id, queryStringParameters);

            result.RemoveAll(r => r.Count == 0);

            if (result != null)
                return result.ToList();

            return null;
        }

        public async Task<int> GetCountOfUserWallets(string accessToken)
        {
            var user = await GetUserFromAccessToken(accessToken);

            if (user.Email == null)
                return 0;

            var result = _unitOfWork.databaseContext.wallets.Where(e=>e.UserId==user.Id).Count();
            return result;

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
    }
}
