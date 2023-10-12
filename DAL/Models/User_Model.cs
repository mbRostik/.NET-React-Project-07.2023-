using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class User_Model 
    {
        public string Email { get; set; } = "";

        public string Password { get; set; } = "";

        public string Name { get; set; } = "";

        public byte[] Avatar { get; set; } = new byte[0];

        public string ClientAvatar { get; set; } = "";
    }
}
