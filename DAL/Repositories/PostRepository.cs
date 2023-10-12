using DAL.Models;
using DAL.Repositories.Contracts;
using DAL.Repositories.Pagination;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class PostRepository : GenericRepository<Post>, IPostRepository
    {
        public PostRepository(MyContext databaseContext)
          : base(databaseContext)
        {
        }

        public async Task<Pagination<User_Post>> GetPaggedByIdForReactAsync(string userid, QueryStringParameters queryStringParameters)
        {
            var result = databaseContext.posts
                .Where(e => e.UserId == userid)
                .Join(databaseContext.Users, p => p.UserId, u => u.Id, (p, u) => new User_Post
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Title = p.Title,
                    Text = p.Text,
                    UserName = u.UserName,
                    Avatar = u.Avatar,
                    Date = p.Date,
                    Photo = p.Photo,
                    Liked = databaseContext.likes.Any(l => l.PostId == p.Id && l.UserId == userid)
                })
                .OrderByDescending(p => p.Date)
                .ToList();

            foreach (var item in result)
            {
                item.CountLikes = databaseContext.likes.Count(l => l.PostId == item.Id);
            }

            var paged_list_coins = await Pagination<User_Post>.ToPagedListAsync(result, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }

        public async Task<Pagination<User_Post>> GetPaggedReccomendationAsync(QueryStringParameters queryStringParameters)
        {
            var result = databaseContext.posts
                .Join(databaseContext.Users, p => p.UserId, u => u.Id, (p, u) => new { Post = p, User = u })
                .Select(x => new User_Post()
                {
                    Id = x.Post.Id,
                    Title = x.Post.Title,
                    Text = x.Post.Text,
                    UserName = x.User.UserName,
                    Avatar = x.User.Avatar,
                    Date = x.Post.Date,
                    Photo = x.Post.Photo,
                    UserId = x.User.Id
                })
                .ToList();

           
            foreach (var item in result)
            {
                item.CountLikes = databaseContext.likes.Count(l => l.PostId == item.Id);
            }
            result.Sort((x, y) => y.CountLikes.CompareTo(x.CountLikes));
            var paged_list_coins = await Pagination<User_Post>.ToPagedListAsync(result, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }
        public async Task<Pagination<User_Post>> GetPaggedReccomendationForAuthAsync(QueryStringParameters queryStringParameters, string userId)
        {
            var result = databaseContext.posts
             .Join(databaseContext.Users, p => p.UserId, u => u.Id, (p, u) => new { Post = p, User = u })
             .Select(x => new User_Post()
             {
                 Id = x.Post.Id,
                 Title = x.Post.Title,
                 Text = x.Post.Text,
                 UserName = x.User.UserName,
                 Avatar = x.User.Avatar,
                 Date = x.Post.Date,
                 Photo = x.Post.Photo,
                 UserId = x.User.Id,
                 Liked = databaseContext.likes.Any(l => l.PostId == x.Post.Id && l.UserId == userId)
             })
             .ToList();

            foreach (var item in result)
            {
                item.CountLikes = databaseContext.likes.Count(l => l.PostId == item.Id);
            }

            result.Sort((x, y) => y.CountLikes.CompareTo(x.CountLikes));
            var paged_list_coins = await Pagination<User_Post>.ToPagedListAsync(result, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }
        public override async Task DeleteByIdAsync(int id)
        {
            await base.DeleteByIdAsync(id);

            var likes = databaseContext.likes.Where(l => l.PostId == id);
            databaseContext.likes.RemoveRange(likes);
            databaseContext.SaveChanges();
        }

        public async Task<Pagination<User_Post>> GetPaggedSomeoneByIdForReactAsync(string userid, string someonesid, QueryStringParameters queryStringParameters)
        {
            var result = databaseContext.posts
                .Where(e => e.UserId == someonesid)
                .Join(databaseContext.Users, p => p.UserId, u => u.Id, (p, u) => new User_Post
                {
                    Id = p.Id,
                    UserId = p.UserId,
                    Title = p.Title,
                    Text = p.Text,
                    UserName = u.UserName,
                    Avatar = u.Avatar,
                    Date = p.Date,
                    Photo = p.Photo,
                    Liked = databaseContext.likes.Any(l => l.PostId == p.Id && l.UserId == userid)
                })
                .OrderByDescending(p => p.Date)
                .ToList();

            foreach (var item in result)
            {
                item.CountLikes = databaseContext.likes.Count(l => l.PostId == item.Id);
            }

            var paged_list_coins = await Pagination<User_Post>.ToPagedListAsync(result, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }

        public async Task<Pagination<User_Post>> GetPaggedByFollowedPosts(string userid, QueryStringParameters queryStringParameters)
        {
            var followedUserIds = databaseContext.follows
                .Where(f => f.FollowerId == userid)
                .Select(f => f.UserId)
                .ToList();

            var result = databaseContext.posts
             .Join(databaseContext.Users, p => p.UserId, u => u.Id, (p, u) => new { Post = p, User = u })
             .Where(p => followedUserIds.Contains(p.Post.UserId))
             .Select(x => new User_Post()
             {
                 Id = x.Post.Id,
                 Title = x.Post.Title,
                 Text = x.Post.Text,
                 UserName = x.User.UserName,
                 Avatar = x.User.Avatar,
                 Date = x.Post.Date,
                 Photo = x.Post.Photo,
                 UserId = x.User.Id,
                 Liked = databaseContext.likes.Any(l => l.PostId == x.Post.Id && l.UserId == userid)
             })
             .ToList();

            foreach (var item in result)
            {
                item.CountLikes = databaseContext.likes.Count(l => l.PostId == item.Id);
            }

            var paged_list_coins = await Pagination<User_Post>.ToPagedListAsync(result, queryStringParameters.PageNumber, queryStringParameters.PageSize);

            return paged_list_coins;
        }
    }
}
