using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webapi.ModelsForReact
{
    public class ChangePasswordModel
    {
        public string oldPassword {  get; set; }
        public string newPassword { get; set; }
    }
}
