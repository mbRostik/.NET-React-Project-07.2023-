using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Follow
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public string FollowerId { get; set; }
        public User User { get; set; }
        public User Follower { get; set; }
    }
}
