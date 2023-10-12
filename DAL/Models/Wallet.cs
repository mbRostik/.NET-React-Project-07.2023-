using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class Wallet
    {
        public int CoinId { get; set; }

        public string UserId { get; set; }

        public float Count { get; set; }

        public Coin Coin { get; set; }

        public User User { get; set; }
    }
}
