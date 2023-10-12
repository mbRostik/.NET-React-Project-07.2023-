using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class UserWithToken
    {      
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string Id { get; set; }

        public virtual ICollection<RefreshToken> RefreshTokens { get; set; }

        public UserWithToken()
        {
            RefreshTokens = new HashSet<RefreshToken>();
        }

        public UserWithToken(User user) 
        {
            RefreshTokens = new HashSet<RefreshToken>();

            this.Id = user.Id;
            this.UserName = user.UserName;
            this.Email = user.Email;            
        }
    }
}