using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Models
{
    public class WalletForReact
    {
        public string UserId { get; set; } = "";
        public int CoinId { get; set; }
        public string CoinName { get; set; } = "";
        public float Count { get; set; }
    }
}
