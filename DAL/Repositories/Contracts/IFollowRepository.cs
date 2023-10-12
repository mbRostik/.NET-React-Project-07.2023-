using DAL.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repositories.Contracts
{
    public interface IFollowRepository : IGenericRepository<Follow>
    {
        Task<bool> Follow(string userid, string followid);
        Task<bool> IsSubscribed(string userid, string followerid);
        Task<int> CountOfFollowers(string userid);
    }
}
