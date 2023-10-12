using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IPostLogic
    {
        IUnitOfWork _unitOfWork { get; }
        Task<List<User_Post>> GetAllUserPosts(string accessToken, QueryStringParameters queryStringParameters);
        Task<List<User_Post>> GetAllReccomendedPosts(QueryStringParameters queryStringParameters, string acctoken);
        Task<int> GetUserPostsCount(string accessToken);
        Task<bool> CreatePost(string accessToken, PostForReact post);
        Task<int> GetPostsCount();
        Task<bool> DeletePost(string accessToken, int idpost);
        Task<bool> SetLike(string accessToken, int idpost);
        Task<List<User_Post>> GetSomeonesPosts(string accessToken,string id, QueryStringParameters queryStringParameters);
        Task<int>GetSomeonesPostsCount(string id);
        Task<bool> EditPost(string accessToken, PostForReact post);
        Task<int> GetFollowedPostsCount(string xAuthAccessToken);
        Task<List<User_Post>> GetPaginatedFollowedPosts(string xAuthAccessToken, QueryStringParameters queryStringParameters);
    }
}
