using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Coin
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public float Price { get; set; }

        public virtual ICollection<Wallet> Wallets { get; set; }
    }
}
