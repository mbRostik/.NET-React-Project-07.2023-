using BLL.Interfaces;
using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Managers
{
    public class PostLogic : IPostLogic
    {
        public IUnitOfWork _unitOfWork { get; }
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public PostLogic(IUnitOfWork unitOfWork, UserManager<User> userManager, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
            _configuration = configuration;
        }

        public async Task<List<User_Post>> GetAllUserPosts(string accessToken, QueryStringParameters queryStringParameters)
        {
            var user = await GetUserFromAccessToken(accessToken);

            if (user.Email == null)
                return null;

            var result = await _unitOfWork.PostRepository.GetPaggedByIdForReactAsync(user.Id, queryStringParameters);

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

        public async Task<int> GetUserPostsCount(string accessToken)
        {
            var user = await GetUserFromAccessToken(accessToken);
            var result = _unitOfWork.databaseContext.posts.Where(e => e.UserId == user.Id).Count();
            return result;
        }

        public async Task<bool> CreatePost(string accessToken, PostForReact post)
        {
            var user = await GetUserFromAccessToken(accessToken);

            if (user.Email == null)
                return false;

            try
            {
                var newpost = new Post()
                {
                    UserId = user.Id,
                    Title = post.Title,
                    Text = post.Text,
                    Photo = post.ByteImage,
                    Date = DateTime.Now
                };

                await _unitOfWork.PostRepository.AddAsync(newpost);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<List<User_Post>> GetAllReccomendedPosts(QueryStringParameters queryStringParameters, string acctoken)
        {
            var user = await GetUserFromAccessToken(acctoken);

            if (user.Email == null)
            {
                var result = await _unitOfWork.PostRepository.GetPaggedReccomendationAsync(queryStringParameters);

                return result;
            }

            var result1 = await _unitOfWork.PostRepository.GetPaggedReccomendationForAuthAsync(queryStringParameters, user.Id);

            return result1;
        }

        public async Task<int> GetPostsCount()
        {
            var result = _unitOfWork.PostRepository.GetAllAsync().Result.Count();

            return result;
        }

        public async Task<bool> DeletePost(string accessToken, int idpost)
        {
            var user = await GetUserFromAccessToken(accessToken);

            if (user.Email == null)
                return false;

            try
            {
                var likes = _unitOfWork.databaseContext.likes.Where(l => l.PostId == idpost);

                if (likes != null)
                {
                    _unitOfWork.databaseContext.likes.RemoveRange(likes);
                    await _unitOfWork.SaveChangesAsync();
                }

                await _unitOfWork.PostRepository.DeleteByIdAsync(idpost);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }

            catch (Exception ex)
            {
                return false;
            }
        }

        public async Task<bool> SetLike(string accessToken, int idpost)
        {
            var user = await GetUserFromAccessToken(accessToken);

            if (user.Email == null)
            {
                return false;
            }

            var result = _unitOfWork.databaseContext.likes.FirstOrDefault(e => e.PostId == idpost && e.UserId == user.Id);

            if (result != null)
            {
                _unitOfWork.databaseContext.likes.Remove(result);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }

            else
            {
                Like temp = new Like();
                temp.UserId = user.Id;
                temp.PostId = idpost;
                await _unitOfWork.databaseContext.likes.AddAsync(temp);
                await _unitOfWork.SaveChangesAsync();
                return true;
            }
        }

        public async Task<List<User_Post>> GetSomeonesPosts(string accessToken, string id, QueryStringParameters queryStringParameters)
        {
            var user = await GetUserFromAccessToken(accessToken);
            var result = await _unitOfWork.PostRepository.GetPaggedSomeoneByIdForReactAsync(user.Id, id, queryStringParameters);

            return result;
        }

        public async Task<int> GetSomeonesPostsCount(string id)
        {
            var result = _unitOfWork.databaseContext.posts.Where(e => e.UserId == id).Count();

            return result;
        }

        public async Task<bool> EditPost(string accessToken, PostForReact post)
        {
            try
            {
                var model = await _unitOfWork.PostRepository.GetByIdAsync(post.PostId);

                model.Title = post.Title;
                model.Text = post.Text;
                model.Photo = post.ByteImage;
                await _unitOfWork.PostRepository.UpdateAsync(model);
                await _unitOfWork.SaveChangesAsync();

                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<int> GetFollowedPostsCount(string xAuthAccessToken)
        {
            var user = await GetUserFromAccessToken(xAuthAccessToken);

            var followedUserIds = _unitOfWork.databaseContext.follows
                .Where(f => f.FollowerId == user.Id)
                .Select(f => f.UserId)
                .ToList();

            var result = _unitOfWork.databaseContext.posts.Where(p => followedUserIds.Contains(p.UserId)).Count();

            return result;
        }

        public async Task<List<User_Post>> GetPaginatedFollowedPosts(string xAuthAccessToken, QueryStringParameters queryStringParameters)
        {
            var user = await GetUserFromAccessToken(xAuthAccessToken);

            var posts = await _unitOfWork.PostRepository.GetPaggedByFollowedPosts(user.Id, queryStringParameters);

            if (posts == null)
                return null;

            return posts;
        }
    }
}
