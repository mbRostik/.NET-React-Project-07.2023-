using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class RefreshToken
    {       
        public int TokenId { get; set; }
        
        public string Token { get; set; }
        
        public DateTime ExpiryDate { get; set; }
        
        public string UserId { get; set; }
        
        public User User { get; set; }
    }
}
