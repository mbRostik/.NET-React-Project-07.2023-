using DAL.Models;
using DAL.Repositories.Contracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories
{
    public class FollowRepository : GenericRepository<Follow>, IFollowRepository
    {
        public FollowRepository(MyContext databaseContext)
          : base(databaseContext)
        {
        }

        public async Task<bool> Follow(string userid, string followerid)
        {
            var model = databaseContext.follows.FirstOrDefault(f => f.UserId == userid && f.FollowerId==followerid);

            if (model != null)
            {
                databaseContext.follows.Remove(model);
                await databaseContext.SaveChangesAsync();
                return false;
            }

            else
            {
                Follow temp = new Follow();
                temp.UserId = userid;
                temp.FollowerId = followerid;
                await databaseContext.follows.AddAsync(temp);
                await databaseContext.SaveChangesAsync();
                return true;
            }
        }

        public async Task<int> CountOfFollowers(string userid)
        {
            var model = databaseContext.follows.Where(e => e.UserId == userid).Count();
            return model;          
        }

        public async Task<bool> IsSubscribed(string userid, string followid)
        {
            var model = databaseContext.follows.FirstOrDefault(f => f.UserId == userid && f.FollowerId == followid);

            if (model != null)
            {
                return true;
            }
            
            else
            {
                return false;
            }
        }
    }
}
