using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class News
    {
        public int Id { get; set; }
        public byte[] Image { get; set; }
        public string Title { get; set; }
        public string Text { get; set; }
    }
}
