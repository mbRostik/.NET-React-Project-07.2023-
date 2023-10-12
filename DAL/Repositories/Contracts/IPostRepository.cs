using DAL.Models;
using DAL.Repositories.Pagination;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories.Contracts
{
    public interface IPostRepository : IGenericRepository<Post>
    {
        public Task<Pagination<User_Post>> GetPaggedByIdForReactAsync(string userid, QueryStringParameters queryStringParameters);
        public Task<Pagination<User_Post>> GetPaggedSomeoneByIdForReactAsync(string userid,string someonesid, QueryStringParameters queryStringParameters);
        public Task<Pagination<User_Post>> GetPaggedReccomendationAsync(QueryStringParameters queryStringParameters);
        public Task<Pagination<User_Post>> GetPaggedReccomendationForAuthAsync(QueryStringParameters queryStringParameters,string userId);
        Task<Pagination<User_Post>> GetPaggedByFollowedPosts(string userid, QueryStringParameters queryStringParameters);
    }
}
