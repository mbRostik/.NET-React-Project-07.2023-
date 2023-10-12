using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class User_Post
    {
        public int Id { get; set; } = 0;
        public string UserId { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
        public bool Liked { get; set; }=false;
        public byte[] Photo { get; set; }
        public DateTime? Date { get; set; }
        public int CountLikes { get; set; } = 0;
        public byte[] Avatar { get; set; }

        public string UserName { get; set; }
    }
}
